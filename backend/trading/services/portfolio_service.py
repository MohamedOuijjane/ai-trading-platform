from decimal import Decimal
from django.db.models import Sum, Count
from administration.models import Trade, BotConfig
from .prediction_service import PredictionService


class PortfolioService:
    @staticmethod
    def get_user_portfolio(user):
        trades = Trade.objects.filter(user=user).order_by("executed_at")
        config, _ = BotConfig.objects.get_or_create(user=user)

        initial_balance = (
            config.max_trade_amount
            if config.max_trade_amount > 0
            else Decimal("10000.0")
        )

        buy_trades = trades.filter(action="BUY")
        sell_trades = trades.filter(action="SELL")

        total_buys = sum(t.price * t.quantity for t in buy_trades)
        total_sells = sum(t.price * t.quantity for t in sell_trades)

        current_balance = initial_balance - total_buys + total_sells

        symbols = [s for s in trades.values_list("symbol", flat=True).distinct() if s]

        market_data_map = {}
        if symbols:
            market_data_map = PredictionService.get_prediction_batch(symbols)

        positions = []
        for symbol in symbols:
            symbol_trades = trades.filter(symbol=symbol)
            qty_buy = (
                symbol_trades.filter(action="BUY").aggregate(total=Sum("quantity"))[
                    "total"
                ]
                or Decimal("0.0")
            )
            qty_sell = (
                symbol_trades.filter(action="SELL").aggregate(total=Sum("quantity"))[
                    "total"
                ]
                or Decimal("0.0")
            )

            current_qty = qty_buy - qty_sell

            if current_qty > 0:
                buy_val = sum(
                    t.price * t.quantity
                    for t in symbol_trades.filter(action="BUY")
                )
                avg_entry_price = (
                    float(buy_val / qty_buy) if qty_buy > 0 else 0.0
                )

                market_data = market_data_map.get(symbol, {})
                current_price = float(market_data.get("price") or 0.0)

                unrealized_pnl = (current_price - avg_entry_price) * float(current_qty)

                positions.append(
                    {
                        "symbol": symbol,
                        "quantity": float(current_qty),
                        "avg_entry_price": avg_entry_price,
                        "current_price": current_price,
                        "unrealized_pnl": unrealized_pnl,
                    }
                )

        realized_pnl = (
            trades.aggregate(total=Sum("profit_loss"))["total"] or Decimal("0.0")
        )

        return {
            "balance": float(current_balance),
            "pnl": float(realized_pnl),
            "positions": positions,
            "history": [
                {
                    "symbol": t.symbol or "UNKNOWN",
                    "action": t.action,
                    "quantity": float(t.quantity),
                    "price": float(t.price),
                    "executed_at": t.executed_at.isoformat() if t.executed_at else None,
                }
                for t in trades.order_by("-executed_at")[:10]
            ],
        }
