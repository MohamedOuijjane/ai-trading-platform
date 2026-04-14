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
        trades = Trade.objects.filter(user=user).order_by('executed_at')
        config, _ = BotConfig.objects.get_or_create(user=user)
        
        # 1. Calculate Balance
        initial_balance = config.max_trade_amount if config.max_trade_amount > 0 else Decimal('10000.0')
        
        # Correctly calculate total value using list comprehension or F expressions
        buy_trades = trades.filter(action='BUY')
        sell_trades = trades.filter(action='SELL')
        
        total_buys = sum(t.price * t.quantity for t in buy_trades)
        total_sells = sum(t.price * t.quantity for t in sell_trades)
        
        # Simplified balance: Initial + Sells - Buys
        current_balance = initial_balance - total_buys + total_sells

        # 2. Calculate Positions
        symbols = trades.values_list('symbol', flat=True).distinct()
        positions = []
        
        for symbol in symbols:
            symbol_trades = trades.filter(symbol=symbol)
            qty_buy = symbol_trades.filter(action='BUY').aggregate(total=Sum('quantity'))['total'] or Decimal('0.0')
            qty_sell = symbol_trades.filter(action='SELL').aggregate(total=Sum('quantity'))['total'] or Decimal('0.0')
            
            current_qty = qty_buy - qty_sell
            
            if current_qty > 0:
                # Weighted Average Entry Price
                buy_val = sum(t.price * t.quantity for t in symbol_trades.filter(action='BUY'))
                avg_entry = buy_val / qty_buy
                
                # Current Price from Proxy
                market_data = PredictionService.get_prediction(symbol)
                current_price = Decimal(str(market_data['price']))
                
                unrealized_pnl = (current_price - avg_entry) * current_qty
                
                positions.append({
                    "ticker": symbol,
                    "quantity": float(current_qty),
                    "entry": float(avg_entry),
                    "current": float(current_price),
                    "pnl": float(unrealized_pnl)
                })

        # 3. Win Rate & Stats
        winning_trades = sum(1 for t in sell_trades if t.profit_loss and t.profit_loss > 0)
        
        win_rate = (winning_trades / sell_trades.count() * 100) if sell_trades.count() > 0 else 0.0
        
        realized_pnl = trades.aggregate(total=Sum('profit_loss'))['total'] or Decimal('0.0')

        return {
            "balance": float(current_balance),
            "pnl": float(realized_pnl),
            "winRate": round(win_rate, 2),
            "positions": positions,
            "history": [
                {
                    "id": t.id,
                    "ticker": t.symbol,
                    "action": t.action,
                    "price": float(t.price),
                    "quantity": float(t.quantity),
                    "date": t.executed_at.isoformat()
                } for t in trades.order_by('-executed_at')[:10]
            ]
        }
