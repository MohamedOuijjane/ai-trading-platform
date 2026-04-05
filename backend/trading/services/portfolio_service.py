from decimal import Decimal
from django.db.models import Sum, Avg
from administration.models import Trade, BotConfig
from .prediction_service import PredictionService

class PortfolioService:
    @staticmethod
    def get_user_portfolio(user):
        """
        Main engine for calculating user portfolio metrics.
        """
        trades = Trade.objects.filter(user=user).order_by('timestamp')
        config, _ = BotConfig.objects.get_or_create(user=user)
        
        # 1. Calculate Balance
        initial_balance = config.max_trade_amount if config.max_trade_amount > 0 else Decimal('10000.0')
        
        # Correctly calculate total value using list comprehension or F expressions
        # Sum('price' * 'quantity') is not valid in standard Django ORM aggregate
        buy_trades = trades.filter(type='BUY')
        sell_trades = trades.filter(type='SELL')
        
        total_buys = sum(t.price * t.quantity for t in buy_trades)
        total_sells = sum(t.price * t.quantity for t in sell_trades)
        total_fees = trades.aggregate(total=Sum('fees'))['total'] or Decimal('0.0')
        
        # Simplified balance: Initial + Sells - Buys - Fees
        current_balance = initial_balance - total_buys + total_sells - total_fees

        # 2. Calculate Positions
        symbols = trades.values_list('symbol', flat=True).distinct()
        positions = []
        
        for symbol in symbols:
            symbol_trades = trades.filter(symbol=symbol)
            qty_buy = symbol_trades.filter(type='BUY').aggregate(total=Sum('quantity'))['total'] or Decimal('0.0')
            qty_sell = symbol_trades.filter(type='SELL').aggregate(total=Sum('quantity'))['total'] or Decimal('0.0')
            
            current_qty = qty_buy - qty_sell
            
            if current_qty > 0:
                # Weighted Average Entry Price
                buy_val = sum(t.price * t.quantity for t in symbol_trades.filter(type='BUY'))
                avg_entry = buy_val / qty_buy
                
                # Current Price from Proxy
                market_data = PredictionService.get_prediction(symbol)
                current_price = Decimal(str(market_data['price']))
                
                unrealized_pnl = (current_price - avg_entry) * current_qty
                
                positions.append({
                    "symbol": symbol,
                    "quantity": float(current_qty),
                    "avg_price": float(avg_entry),
                    "current_price": float(current_price),
                    "pnl": float(unrealized_pnl)
                })

        # 3. Win Rate & Stats
        total_trade_count = trades.count()
        sell_trades = trades.filter(type='SELL')
        winning_trades = sum(1 for t in sell_trades if t.pnl > 0)
        
        win_rate = (winning_trades / sell_trades.count() * 100) if sell_trades.count() > 0 else 0.0
        
        realized_pnl = trades.aggregate(total=Sum('pnl'))['total'] or Decimal('0.0')

        return {
            "balance": float(current_balance),
            "pnl": float(realized_pnl),
            "winRate": round(win_rate, 2),
            "positions": positions,
            "history": [
                {
                    "id": t.id,
                    "ticker": t.symbol,
                    "action": t.type,
                    "price": float(t.price),
                    "quantity": float(t.quantity),
                    "date": t.timestamp.isoformat()
                } for t in trades.order_by('-timestamp')[:10]
            ]
        }
