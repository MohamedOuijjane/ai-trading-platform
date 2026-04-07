from rest_framework import serializers
from administration.models import Trade, BotConfig, Prediction, Portfolio, Position

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['symbol', 'quantity', 'avg_price']

class PortfolioSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Portfolio
        fields = ['balance', 'positions', 'created_at']

class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = ['id', 'symbol', 'action', 'price', 'quantity', 'profit_loss', 'confidence', 'executed_at']
        read_only_fields = ['id', 'profit_loss', 'confidence', 'executed_at']

class BotConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotConfig
        fields = ['min_confidence', 'stop_loss_pct', 'max_trade_amount', 'is_active']

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = ['ticker', 'signal', 'confidence', 'price', 'timestamp']
        read_only_fields = ['timestamp']
