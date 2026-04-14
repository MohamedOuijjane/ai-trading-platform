from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, generics
from administration.models import BotConfig, Prediction, Trade, SystemSettings
from .serializers import TradeSerializer, BotConfigSerializer, PredictionSerializer
from .services.portfolio_service import PortfolioService
from .services.trade_service import TradeService
from .services.prediction_service import PredictionService

class PortfolioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        portfolio_data = PortfolioService.get_user_portfolio(request.user)
        return Response(portfolio_data)

class TradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
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
        prediction = PredictionService.get_prediction(ticker, request.user)
        result = {
            **prediction,
            "auto_executed": False,
            "auto_trade_skipped": None,
        }

        if not prediction.get("valid"):
            return Response(result)

        if request.user.is_authenticated:
            result = self._maybe_auto_trade(request, prediction, result)

        return Response(result)

    def _maybe_auto_trade(self, request, prediction, result):
        try:
            settings, _ = SystemSettings.objects.get_or_create(pk=1)

            if not settings.auto_trade:
                result["auto_trade_skipped"] = "auto_trade disabled in system settings"
                return result

            signal = prediction.get("signal")
            confidence = prediction.get("confidence", 0.0)
            min_conf = settings.min_confidence

            if signal == "HOLD" or confidence < min_conf:
                result["auto_trade_skipped"] = f"signal={signal}, confidence={confidence:.2f} < threshold={min_conf}"
                return result

            config, _ = BotConfig.objects.get_or_create(user=request.user)
            if not config.is_active:
                result["auto_trade_skipped"] = "bot not active for this user"
                return result

            if config.paper_trading:
                result["auto_trade_skipped"] = "paper trading enabled — no real trade executed"
                return result

            quantity = config.max_trade_amount / prediction["price"]
            trade = TradeService.execute_trade(request.user, prediction["ticker"], signal, float(quantity))
            result["auto_executed"] = True
            result["trade_id"] = trade.id
            result["auto_trade_skipped"] = None

        except Exception as e:
            result["auto_trade_error"] = str(e)

        return result

class PredictionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PredictionSerializer
    queryset = Prediction.objects.all().order_by('-created_at')

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            return Response({"status": "ok"})
        except:
            return Response({"status": "error"}, status=503)

class MarketPricesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        symbols = ["AAPL", "NVDA", "BTC-USD", "ETH-USD", "MSFT", "GOOGL", "TSLA", "AMZN"]
        prices = []
        for symbol in symbols:
            data = PredictionService.get_prediction(symbol)
            if data.get("valid", True) and data.get("price", 0) > 0:
                change = data.get("change_pct", 0.0) or (abs(data.get("price", 0) - 100) / 100 * (1 if data.get("price", 0) > 100 else -1))
                prices.append({
                    "symbol": symbol,
                    "price": data.get("price", 0.0),
                    "change": round(change, 2),
                    "change_pct": round(change, 2),
                    "high": data.get("price", 0.0) * 1.02,
                    "low": data.get("price", 0.0) * 0.98,
                    "volume": 1000000
                })

        if not prices:
            prices = [
                {"symbol": "BTC-USD", "price": 70000, "change": 2.5, "change_pct": 2.5, "high": 71400, "low": 68600, "volume": 15000000},
                {"symbol": "ETH-USD", "price": 2000, "change": -1.2, "change_pct": -1.2, "high": 2040, "low": 1960, "volume": 8000000},
                {"symbol": "TSLA", "price": 300, "change": 1.1, "change_pct": 1.1, "high": 306, "low": 294, "volume": 50000000},
                {"symbol": "AAPL", "price": 170, "change": 0.5, "change_pct": 0.5, "high": 173, "low": 167, "volume": 60000000},
                {"symbol": "NVDA", "price": 850, "change": 3.2, "change_pct": 3.2, "high": 867, "low": 833, "volume": 25000000},
                {"symbol": "MSFT", "price": 420, "change": -0.3, "change_pct": -0.3, "high": 427, "low": 413, "volume": 20000000},
                {"symbol": "GOOGL", "price": 150, "change": 0.8, "change_pct": 0.8, "high": 153, "low": 147, "volume": 18000000},
                {"symbol": "AMZN", "price": 180, "change": 1.5, "change_pct": 1.5, "high": 184, "low": 176, "volume": 35000000},
            ]

        return Response(prices)

class TradeListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TradeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff:
            return Trade.objects.order_by('-executed_at')
        return Trade.objects.filter(user=user).order_by('-executed_at')

class BotConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        config, _ = BotConfig.objects.get_or_create(user=request.user)
        serializer = BotConfigSerializer(config)
        return Response(serializer.data)

    def post(self, request):
        config, _ = BotConfig.objects.get_or_create(user=request.user)
        serializer = BotConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)