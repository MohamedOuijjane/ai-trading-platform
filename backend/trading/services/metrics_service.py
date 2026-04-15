from decimal import Decimal
from django.db.models import Sum, Avg
from administration.models import Trade, Prediction


class MetricsService:
    @staticmethod
    def get_metrics(user):
        trades = Trade.objects.filter(user=user)
        total_trades = trades.count()

        if total_trades == 0:
            return {
                "total_trades": 0,
                "accuracy": 0.0,
                "avg_confidence": 0.0,
                "total_pnl": 0.0,
            }

        sell_trades = trades.filter(action="SELL")
        total_pnl_decimal = (
            trades.aggregate(total=Sum("profit_loss"))["total"] or Decimal("0.0")
        )
        total_pnl = float(total_pnl_decimal)

        confidence_avg = trades.aggregate(avg=Avg("confidence"))["avg"]
        avg_confidence = float(confidence_avg) if confidence_avg else 0.0

        winning_sells = sell_trades.filter(profit_loss__gt=0).count()
        total_sells_with_pl = sell_trades.exclude(profit_loss=None).count()
        accuracy = (
            (winning_sells / total_sells_with_pl * 100)
            if total_sells_with_pl > 0
            else 0.0
        )

        return {
            "total_trades": total_trades,
            "accuracy": round(accuracy, 2),
            "avg_confidence": round(avg_confidence, 2),
            "total_pnl": round(total_pnl, 2),
        }
