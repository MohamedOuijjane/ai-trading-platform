from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from administration.models import BotConfig
from .serializers import TradeSerializer, BotConfigSerializer, PredictionSerializer
from .services.portfolio_service import PortfolioService
from .services.trade_service import TradeService
from .services.prediction_service import PredictionService

class PortfolioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user portfolio metrics."""
        portfolio_data = PortfolioService.get_user_portfolio(request.user)
        return Response(portfolio_data)

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
    permission_classes = [AllowAny]

    def get(self, request, ticker):
        """Proxy prediction from ML service."""
        prediction = PredictionService.get_prediction(ticker, request.user)
        return Response(prediction)

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
