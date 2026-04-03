from django.contrib import admin
from django.utils.html import format_html
from .models import Trade, BotConfig, Prediction, StockPrice


@admin.register(StockPrice)
class StockPriceAdmin(admin.ModelAdmin):
    list_display  = ['symbol', 'close', 'open', 'high', 'low',
                     'volume', 'timestamp']
    list_filter   = ['symbol']
    search_fields = ['symbol']
    ordering      = ['-timestamp']


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display  = ['symbol', 'colored_action', 'user', 'price',
                     'quantity', 'confidence_bar', 'profit_loss_colored',
                     'executed_at']
    list_filter   = ['action', 'symbol', 'executed_at']
    search_fields = ['symbol', 'user__username']
    ordering      = ['-executed_at']
    readonly_fields = ['executed_at']

    def colored_action(self, obj):
        color = '#1D9E75' if obj.action == 'BUY' else '#E24B4A'
        return format_html(
            '<span style="color:{}; font-weight:bold;">{}</span>',
            color, obj.action
        )
    colored_action.short_description = 'Action'

    def confidence_bar(self, obj):
        pct   = int(obj.confidence * 100)
        color = '#1D9E75' if pct >= 75 else '#BA7517' if pct >= 55 else '#E24B4A'
        return format_html(
            '<div style="width:80px;background:#eee;border-radius:4px;">'
            '<div style="width:{}px;background:{};height:8px;border-radius:4px;"></div>'
            '</div> {}%',
            int(pct * 0.8), color, pct
        )
    confidence_bar.short_description = 'Confiance IA'

    def profit_loss_colored(self, obj):
        if obj.profit_loss is None:
            return '—'
        color = '#1D9E75' if obj.profit_loss >= 0 else '#E24B4A'
        sign  = '+' if obj.profit_loss >= 0 else ''
        return format_html(
            '<span style="color:{};font-weight:bold;">{}{}</span>',
            color, sign, obj.profit_loss
        )
    profit_loss_colored.short_description = 'P&L'


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display  = ['symbol', 'colored_signal', 'confidence_display',
                     'predicted_price', 'actual_price', 'created_at']
    list_filter   = ['signal', 'symbol']
    search_fields = ['symbol']
    ordering      = ['-created_at']

    def colored_signal(self, obj):
        colors = {'BUY': '#1D9E75', 'SELL': '#E24B4A', 'HOLD': '#BA7517'}
        color  = colors.get(obj.signal, '#888')
        return format_html(
            '<span style="color:{};font-weight:bold;">{}</span>',
            color, obj.signal
        )
    colored_signal.short_description = 'Signal IA'

    def confidence_display(self, obj):
        pct   = int(obj.confidence * 100)
        color = '#1D9E75' if pct >= 75 else '#BA7517' if pct >= 55 else '#E24B4A'
        return format_html(
            '<span style="color:{};font-weight:bold;">{}%</span>',
            color, pct
        )
    confidence_display.short_description = 'Confiance'


@admin.register(BotConfig)
class BotConfigAdmin(admin.ModelAdmin):
    list_display  = ['user', 'bot_status', 'min_confidence',
                     'max_trade_amount', 'stop_loss_pct', 'paper_mode']
    list_filter   = ['is_active', 'paper_trading']
    search_fields = ['user__username']

    def bot_status(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color:#1D9E75;font-weight:bold;">Actif</span>'
            )
        return format_html(
            '<span style="color:#E24B4A;font-weight:bold;">Inactif</span>'
        )
    bot_status.short_description = 'Statut'

    def paper_mode(self, obj):
        if obj.paper_trading:
            return format_html(
                '<span style="color:#BA7517;font-weight:bold;">Paper</span>'
            )
        return format_html(
            '<span style="color:#1D9E75;">Réel</span>'
        )
    paper_mode.short_description = 'Mode'