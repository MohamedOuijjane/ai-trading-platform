from django.db import models
from django.contrib.auth.models import User

class StockPrice(models.Model):
    symbol    = models.CharField(max_length=10)
    open      = models.DecimalField(max_digits=12, decimal_places=4)
    close     = models.DecimalField(max_digits=12, decimal_places=4)
    high      = models.DecimalField(max_digits=12, decimal_places=4)
    low       = models.DecimalField(max_digits=12, decimal_places=4)
    volume    = models.BigIntegerField()
    timestamp = models.DateTimeField()

    class Meta:
        verbose_name        = "Prix du marché"
        verbose_name_plural = "Prix du marché"
        ordering            = ['-timestamp']

    def __str__(self):
        return f"{self.symbol} — {self.close} ({self.timestamp.date()})"


class Trade(models.Model):
    ACTIONS = [('BUY', 'Acheter'), ('SELL', 'Vendre')]

    user        = models.ForeignKey(User, on_delete=models.CASCADE,
                                    verbose_name="Utilisateur")
    symbol      = models.CharField(max_length=10, verbose_name="Symbole")
    action      = models.CharField(max_length=4, choices=ACTIONS,
                                   verbose_name="Action")
    price       = models.DecimalField(max_digits=12, decimal_places=4,
                                      verbose_name="Prix")
    quantity    = models.DecimalField(max_digits=10, decimal_places=2,
                                      verbose_name="Quantité")
    confidence  = models.FloatField(verbose_name="Confiance IA (%)")
    profit_loss = models.DecimalField(max_digits=10, decimal_places=2,
                                      null=True, blank=True,
                                      verbose_name="Profit / Perte")
    executed_at = models.DateTimeField(auto_now_add=True,
                                       verbose_name="Exécuté le")

    class Meta:
        verbose_name        = "Trade"
        verbose_name_plural = "Trades"
        ordering            = ['-executed_at']

    def __str__(self):
        return f"{self.action} {self.symbol} — {self.user.username}"


class Prediction(models.Model):
    SIGNALS = [('BUY','Acheter'), ('SELL','Vendre'), ('HOLD','Attendre')]

    symbol          = models.CharField(max_length=10, verbose_name="Symbole")
    signal          = models.CharField(max_length=4, choices=SIGNALS,
                                       verbose_name="Signal IA")
    confidence      = models.FloatField(verbose_name="Confiance (%)")
    predicted_price = models.DecimalField(max_digits=12, decimal_places=4,
                                          verbose_name="Prix prédit")
    actual_price    = models.DecimalField(max_digits=12, decimal_places=4,
                                          null=True, blank=True,
                                          verbose_name="Prix réel")
    created_at      = models.DateTimeField(auto_now_add=True,
                                           verbose_name="Créé le")

    class Meta:
        verbose_name        = "Prédiction IA"
        verbose_name_plural = "Prédictions IA"
        ordering            = ['-created_at']

    def __str__(self):
        return f"{self.symbol} → {self.signal} ({self.confidence*100:.0f}%)"


class BotConfig(models.Model):
    user             = models.OneToOneField(User, on_delete=models.CASCADE,
                                            verbose_name="Utilisateur")
    is_active        = models.BooleanField(default=True,
                                           verbose_name="Bot actif")
    min_confidence   = models.FloatField(default=0.75,
                                         verbose_name="Confiance minimum")
    max_trade_amount = models.DecimalField(max_digits=10, decimal_places=2,
                                           default=500,
                                           verbose_name="Montant max / trade")
    stop_loss_pct    = models.FloatField(default=5.0,
                                         verbose_name="Stop-loss (%)")
    paper_trading    = models.BooleanField(default=False,
                                           verbose_name="Paper trading")
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Configuration Bot"
        verbose_name_plural = "Configurations Bot"

    def __str__(self):
        return f"Config de {self.user.username}"


class SystemSettings(models.Model):
    RISK_CHOICES = [
        ('low', 'Faible'),
        ('medium', 'Moyen'),
        ('high', 'Élevé'),
    ]

    trading_enabled   = models.BooleanField(default=True, verbose_name="Trading activé")
    max_trade_amount = models.FloatField(default=1000.0, verbose_name="Montant max / trade")
    risk_level       = models.CharField(max_length=10, choices=RISK_CHOICES, default='medium',
                                        verbose_name="Niveau de risque")
    auto_trade       = models.BooleanField(default=False, verbose_name="Trading automatique")
    min_confidence   = models.FloatField(default=0.75, verbose_name="Confiance minimum IA")
    updated_at       = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")

    class Meta:
        verbose_name        = "Paramètres Système"
        verbose_name_plural = "Paramètres Système"

    def __str__(self):
        return f"System Settings (risk: {self.risk_level})"