from decimal import Decimal
from administration.models import Trade, BotConfig
from .prediction_service import PredictionService
from rest_framework.exceptions import ValidationError

class TradeService:
    FEES_PCT = Decimal('0.001')  # 0.1% fees

    @staticmethod
    def execute_trade(user, ticker, action, quantity):
        """
        Main logic for executing a trade with financial calculations.
        """
        ticker = ticker.upper()
        quantity = Decimal(str(quantity))

        # 1. Get current price from ML service proxy
        prediction_data = PredictionService.get_prediction(ticker)
        price = Decimal(str(prediction_data['price']))
        
        if price <= 0:
            raise ValidationError({"detail": "Unable to get current market price."})

        # 2. Financial Validations
        config, _ = BotConfig.objects.get_or_create(user=user)
        total_value = price * quantity
        fee = total_value * TradeService.FEES_PCT

        if action == 'BUY':
            if config.max_trade_amount < (total_value + fee):
                raise ValidationError({"detail": "Insufficient balance/max trade limit."})
        
        elif action == 'SELL':
            # Check if user has enough quantity to sell
            current_pos = TradeService.get_current_position(user, ticker)
            if current_pos < quantity:
                raise ValidationError({"detail": f"Insufficient {ticker} quantity to sell."})

        # 3. Compute PnL (FIFO logic for SELL)
        pnl = Decimal('0.0')
        if action == 'SELL':
            pnl = TradeService.calculate_fifo_pnl(user, ticker, quantity, price, fee)

        # 4. Save Trade
        trade = Trade.objects.create(
            user=user,
            symbol=ticker,
            type=action,
            price=price,
            quantity=quantity,
            fees=fee,
            pnl=pnl,
            ia_confidence=prediction_data.get('confidence', 0.0)
        )

        return trade

    @staticmethod
    def get_current_position(user, ticker):
        """Calculate current holdings for a ticker."""
        trades = Trade.objects.filter(user=user, symbol=ticker)
        buys = sum(t.quantity for t in trades if t.type == 'BUY')
        sells = sum(t.quantity for t in trades if t.type == 'SELL')
        return buys - sells

    @staticmethod
    def calculate_fifo_pnl(user, ticker, sell_qty, sell_price, sell_fee):
        """
        Simplified FIFO PnL calculation.
        Computes PnL based on the weighted average of previous BUYs.
        """
        buy_trades = Trade.objects.filter(user=user, symbol=ticker, type='BUY')
        total_buy_qty = sum(t.quantity for t in buy_trades)
        
        if total_buy_qty == 0:
            return Decimal('0.0')

        # Weighted average entry price
        total_buy_cost = sum(t.price * t.quantity for t in buy_trades)
        avg_entry_price = total_buy_cost / total_buy_qty
        
        # PnL = (SellPrice - AvgEntryPrice) * Qty - Fees
        pnl = (sell_price - avg_entry_price) * sell_qty - sell_fee
        return pnl
