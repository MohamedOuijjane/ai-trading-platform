from rest_framework import serializers
from administration.models import Trade, BotConfig, Prediction

class TradeSerializer(serializers.ModelSerializer):
    ticker = serializers.CharField(source='symbol')
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Trade
        fields = ['id', 'user', 'ticker', 'action', 'price', 'quantity', 'profit_loss', 'confidence', 'executed_at']
        read_only_fields = ['id', 'user', 'profit_loss', 'executed_at']

class BotConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotConfig
        fields = ['min_confidence', 'stop_loss_pct', 'max_trade_amount', 'is_active']

class PredictionSerializer(serializers.ModelSerializer):
    ticker = serializers.CharField(source='symbol')
    price = serializers.DecimalField(source='predicted_price', max_digits=12, decimal_places=4)

    class Meta:
        model = Prediction
        fields = ['id', 'ticker', 'signal', 'confidence', 'price', 'actual_price', 'created_at']
        read_only_fields = ['id', 'created_at']
