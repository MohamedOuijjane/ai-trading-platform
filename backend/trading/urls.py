from django.urls import path
from .views import PortfolioView, TradeView, TradeListView, PredictionProxyView, PredictionListView, MarketPricesView, HealthCheckView, BotConfigView
from administration.views import CeleryLogsView, AuditLogsView, MLModelsView, SettingsView

urlpatterns = [
    path('portfolio/', PortfolioView.as_view(), name='api-portfolio'),
    path('trade/', TradeView.as_view(), name='api-trade'),
    path('trades/', TradeListView.as_view(), name='api-trades'),
    path('predict/<str:ticker>/', PredictionProxyView.as_view(), name='api-predict'),
    path('predictions/', PredictionListView.as_view(), name='api-predictions'),
    path('market/prices/', MarketPricesView.as_view(), name='api-market-prices'),
    path('health/', HealthCheckView.as_view(), name='api-health'),
    path('my-config/', BotConfigView.as_view(), name='api-bot-config'),
    path('logs/celery/', CeleryLogsView.as_view(), name='api-logs-celery'),
    path('logs/audit/', AuditLogsView.as_view(), name='api-logs-audit'),
    path('ml/models/', MLModelsView.as_view(), name='api-ml-models'),
    path('settings/', SettingsView.as_view(), name='api-settings'),
]
