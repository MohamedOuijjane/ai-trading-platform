from decimal import Decimal
from django.db import transaction
from administration.models import Trade, BotConfig, Portfolio, Position
from .prediction_service import PredictionService
from rest_framework.exceptions import ValidationError

class TradeService:
    FEES_PCT = Decimal('0.001')  # 0.1% fees

    @staticmethod
    def execute_trade(user, ticker, action, quantity):
        """
        Main logic for executing a trade with financial calculations.
        Updates balance and positions in the Portfolio.
        """
        ticker = ticker.upper()
        quantity = Decimal(str(quantity))

        with transaction.atomic():
            # 1. Get/Create Portfolio
            portfolio, _ = Portfolio.objects.get_or_create(user=user)
            
            # 2. Get current price
            prediction_data = PredictionService.get_prediction(ticker)
            price = Decimal(str(prediction_data['price']))
            
            if price <= 0:
                raise ValidationError({"detail": "Unable to get current market price."})

            total_value = price * quantity
            fee = total_value * TradeService.FEES_PCT
            total_cost = total_value + fee

            if action == 'BUY':
                if portfolio.balance < total_cost:
                    raise ValidationError({"detail": "Insufficient balance."})
                
                # Update Balance
                portfolio.balance -= total_cost
                portfolio.save()

                # Update Position
                position, created = Position.objects.get_or_create(portfolio=portfolio, symbol=ticker)
                if created:
                    position.quantity = quantity
                    position.avg_price = price
                else:
                    new_total_qty = position.quantity + quantity
                    new_total_cost = (position.quantity * position.avg_price) + (quantity * price)
                    position.avg_price = new_total_cost / new_total_qty
                    position.quantity = new_total_qty
                position.save()

            elif action == 'SELL':
                try:
                    position = Position.objects.get(portfolio=portfolio, symbol=ticker)
                    if position.quantity < quantity:
                        raise ValidationError({"detail": f"Insufficient {ticker} quantity to sell."})
                except Position.DoesNotExist:
                    raise ValidationError({"detail": f"No position in {ticker} to sell."})

                # Update Balance
                portfolio.balance += (total_value - fee)
                portfolio.save()

                # Update Position
                position.quantity -= quantity
                if position.quantity == 0:
                    position.delete()
                else:
                    position.save()

            # 3. Compute PnL (Realized PnL for the trade)
            pnl = Decimal('0.0')
            if action == 'SELL':
                pnl = (price - position.avg_price) * quantity - fee

            # 4. Save Trade History
            trade = Trade.objects.create(
                user=user,
                symbol=ticker,
                action=action,
                price=price,
                quantity=quantity,
                confidence=prediction_data.get('confidence', 0.0),
                profit_loss=pnl
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
