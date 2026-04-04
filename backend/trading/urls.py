from django.urls import path
from .views import PortfolioView, TradeView, PredictionProxyView, BotConfigView

urlpatterns = [
    path('portfolio/', PortfolioView.as_view(), name='api-portfolio'),
    path('trade/', TradeView.as_view(), name='api-trade'),
    path('predict/<str:ticker>/', PredictionProxyView.as_view(), name='api-predict'),
    path('my-config/', BotConfigView.as_view(), name='api-bot-config'),
]
