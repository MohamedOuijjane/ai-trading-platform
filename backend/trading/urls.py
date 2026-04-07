from django.urls import path
from . import views

urlpatterns = [
    path('portfolio/', views.PortfolioView.as_view(), name='portfolio'),
    path('trade/', views.TradeView.as_view(), name='trade'),
    path('predict/<str:ticker>/', views.PredictionProxyView.as_view(), name='prediction_proxy'),
    path('prediction-status/<str:task_id>/', views.PredictionStatusView.as_view(), name='prediction_status'),
    path('analytics/performance/', views.AnalyticsPerformanceView.as_view(), name='analytics_performance'),
    path('bot-config/', views.BotConfigView.as_view(), name='bot_config'),
]
