from rest_framework import serializers
from administration.models import Trade, BotConfig, Prediction

class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = ['id', 'symbol', 'type', 'price', 'quantity', 'pnl', 'fees', 'ia_confidence', 'timestamp']
        read_only_fields = ['id', 'pnl', 'fees', 'ia_confidence', 'timestamp']

class BotConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotConfig
        fields = ['min_confidence', 'stop_loss_pct', 'max_trade_amount', 'is_active']

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = ['ticker', 'signal', 'confidence', 'price', 'timestamp']
        read_only_fields = ['timestamp']
