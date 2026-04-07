from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/market/$', consumers.MarketConsumer.as_asgi()),
]
