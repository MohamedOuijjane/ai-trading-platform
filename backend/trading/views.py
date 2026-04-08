from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from celery.result import AsyncResult
from administration.models import BotConfig, Portfolio, Trade
from .serializers import TradeSerializer, BotConfigSerializer, PredictionSerializer, PortfolioSerializer
from .services.portfolio_service import PortfolioService
from .services.trade_service import TradeService
from .services.prediction_service import PredictionService
from .tasks import get_ml_prediction_task

class PortfolioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user portfolio metrics."""
        portfolio, _ = Portfolio.objects.get_or_create(user=request.user)
        serializer = PortfolioSerializer(portfolio)
        
        # Add history
        trades = Trade.objects.filter(user=request.user).order_by('-executed_at')[:20]
        trade_serializer = TradeSerializer(trades, many=True)
        
        return Response({
            "portfolio": serializer.data,
            "history": trade_serializer.data
        })

class TradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Execute a trade."""
        ticker = request.data.get('ticker')
        action = request.data.get('action')
        quantity = request.data.get('quantity')

        if not ticker or not action or not quantity:
            return Response({"detail": "Ticker, action, and quantity are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            trade = TradeService.execute_trade(request.user, ticker, action, quantity)
            serializer = TradeSerializer(trade)
            return Response({
                "message": "Trade executed successfully.",
                "trade": serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PredictionProxyView(APIView):
    # JWT authentication is now required for production safety.
    # AllowAny was previously used only for initial integration testing.
    # To test with a token, obtain one from /api/token/ and use:
    # Authorization: Bearer <access_token>
    # permission_classes = [AllowAny]  # OLD: TEMPORARY (testing only)
    permission_classes = [IsAuthenticated]

    def get(self, request, ticker):
        """Trigger async prediction task."""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Prediction requested for {ticker} by {request.user}")
        
        # Trigger Celery Task
        task = get_ml_prediction_task.delay(ticker)
        
        return Response({
            "task_id": task.id,
            "status": "PENDING",
            "message": "Prediction task has been queued."
        })

class PredictionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        """Check status of a prediction task."""
        res = AsyncResult(task_id)
        
        response_data = {
            "task_id": task_id,
            "status": res.status,
        }
        
        if res.ready():
            if res.successful():
                response_data["result"] = res.result
            else:
                response_data["error"] = str(res.result)
                
        return Response(response_data)

class AnalyticsPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get prediction performance analytics."""
        from django.db.models import Count, Avg, Q
        from administration.models import Prediction
        
        # Accuracy over time (last 30 days)
        from django.utils import timezone
        from datetime import timedelta
        
        last_30_days = timezone.now() - timedelta(days=30)
        
        daily_accuracy = Prediction.objects.filter(
            created_at__gte=last_30_days,
            is_correct__isnull=False
        ).values('created_at__date').annotate(
            total=Count('id'),
            correct=Count('id', filter=Q(is_correct=True))
        ).order_by('created_at__date')
        
        accuracy_data = [
            {
                "date": str(item['created_at__date']),
                "accuracy": (item['correct'] / item['total'] * 100) if item['total'] > 0 else 0
            } for item in daily_accuracy
        ]
        
        # Signal Distribution
        signals = Prediction.objects.values('signal').annotate(
            count=Count('id')
        )
        signal_distribution = {item['signal']: item['count'] for item in signals}
        
        # Profit/Loss from Trades
        trades = Trade.objects.filter(user=request.user).order_by('executed_at')
        cumulative_pnl = 0
        pnl_history = []
        for t in trades:
            cumulative_pnl += float(t.profit_loss or 0)
            pnl_history.append({
                "date": str(t.executed_at.date()),
                "pnl": cumulative_pnl
            })
            
        return Response({
            "accuracy_history": accuracy_data,
            "signal_distribution": signal_distribution,
            "pnl_history": pnl_history
        })

class BotConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user bot configuration."""
        config, _ = BotConfig.objects.get_or_create(user=request.user)
        serializer = BotConfigSerializer(config)
        return Response(serializer.data)

    def post(self, request):
        """Update bot configuration."""
        config, _ = BotConfig.objects.get_or_create(user=request.user)
        serializer = BotConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
