from django.db.models import Sum
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer, SystemSettingsSerializer
from .models import BotConfig, Trade, Prediction, SystemSettings

# --- STATS DASHBOARD ---
class StatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Recent activity (Trades and Predictions)
        recent_trades = Trade.objects.all().order_by('-executed_at')[:5]
        recent_preds = Prediction.objects.all().order_by('-created_at')[:5]
        
        activity = []
        for t in recent_trades:
            activity.append({
                "time": t.executed_at.strftime("%H:%M:%S"),
                "user": t.user.username if t.user else "System",
                "action": f"Trade {t.action} {t.symbol}",
                "model": "Trade",
                "status": "green" if t.profit_loss is None or t.profit_loss >= 0 else "red"
            })
        for p in recent_preds:
            activity.append({
                "time": p.created_at.strftime("%H:%M:%S"),
                "user": "celery",
                "action": f"IA: {p.symbol} → {p.signal}",
                "model": "Prediction",
                "status": "purple"
            })
        
        activity.sort(key=lambda x: x['time'], reverse=True)

        return Response({
            'users':       User.objects.count(),
            'trades':      Trade.objects.count(),
            'predictions': Prediction.objects.count(),
            'bots':        BotConfig.objects.filter(is_active=True).count(),
            'pnl':         Trade.objects.aggregate(total=Sum('profit_loss'))['total'] or 0.0,
            'recent_activity': activity[:10]
        })

# --- LOGS SYSTEM ---
class CeleryLogsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # On simule des logs de tâches Celery
        import datetime
        now = datetime.datetime.now()
        logs = [
            {"id": 1, "time": (now - datetime.timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M:%S"), "user": "System", "action": "Analyse", "model": "LSTM_BTC", "object": "BTC-USD", "message": "Prédiction générée avec succès"},
            {"id": 2, "time": (now - datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S"), "user": "System", "action": "Trade", "model": "BotConfig", "object": "ETH-USD", "message": "Ordre d'achat exécuté automatiquement"},
            {"id": 3, "time": (now - datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S"), "user": "superadmin", "action": "Changement", "model": "BotConfig", "object": "Config", "message": "Mise à jour de la confiance minimum à 0.85"},
            {"id": 4, "time": (now - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"), "user": "System", "action": "Sync", "model": "StockPrice", "object": "AAPL", "message": "Mise à jour des prix historiques"},
        ]
        return Response(logs)

class AuditLogsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # On simule des logs d'audit Django
        import datetime
        now = datetime.datetime.now()
        logs = [
            {"id": 1, "time": (now - datetime.timedelta(minutes=2)).strftime("%Y-%m-%d %H:%M:%S"), "user": "superadmin", "action": "Addition", "flag": 1, "model": "Trade", "object": "Trade #152", "message": "Achat de 0.5 BTC"},
            {"id": 2, "time": (now - datetime.timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S"), "user": "superadmin", "action": "Changement", "flag": 2, "model": "User", "object": "mariam", "message": "Changement du statut actif"},
            {"id": 3, "time": (now - datetime.timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S"), "user": "superadmin", "action": "Addition", "flag": 1, "model": "Prediction", "object": "Prediction #442", "message": "Signal BUY pour TSLA"},
        ]
        return Response(logs)

class MLModelsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Données simulées pour les modèles ML
        models = [
            {"ticker": "BTC-USD", "status": "ready", "model_exists": True, "scaler_exists": True, "size_kb": 1240, "predictions": 452},
            {"ticker": "ETH-USD", "status": "ready", "model_exists": True, "scaler_exists": True, "size_kb": 1180, "predictions": 312},
            {"ticker": "TSLA", "status": "ready", "model_exists": True, "scaler_exists": True, "size_kb": 980, "predictions": 124},
            {"ticker": "AAPL", "status": "missing", "model_exists": False, "scaler_exists": True, "size_kb": 0, "predictions": 0},
        ]
        metrics = {
            "avg_latency_ms": 145.2,
            "total_predictions": 888,
            "success_rate": 98.5
        }
        return Response({"models": models, "metrics": metrics})

# --- LISTE & CRÉATION ---
class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

# --- DÉTAIL, MODIFICATION, SUPPRESSION ---
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

# --- ACTIVER / DÉSACTIVER ---
class UserToggleActiveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            return Response({
                'message': f"Utilisateur {'activé' if user.is_active else 'désactivé'}",
                'is_active': user.is_active
            })
        except User.DoesNotExist:
            return Response({'error': 'Introuvable'}, status=404)

# --- SYSTEM SETTINGS ---
class SettingsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        settings, _ = SystemSettings.objects.get_or_create(pk=1)
        serializer = SystemSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        settings, _ = SystemSettings.objects.get_or_create(pk=1)
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
