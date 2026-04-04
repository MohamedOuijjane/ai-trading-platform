from django.contrib.auth.models import User
from rest_framework import serializers
from .models import BotConfig

class BotConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotConfig
        fields = ['is_active', 'min_confidence', 'max_trade_amount',
                  'stop_loss_pct', 'paper_trading']

class UserSerializer(serializers.ModelSerializer):
    bot_config = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'is_active', 'is_staff', 'date_joined', 'last_login',
                  'bot_config']

    def get_bot_config(self, obj):
        try:
            return BotConfigSerializer(obj.botconfig).data
        except BotConfig.DoesNotExist:
            return None

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name',
                  'last_name', 'is_staff']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'is_active', 'is_staff']