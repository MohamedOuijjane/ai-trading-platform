"""
train_all.py – Entraîne le modèle LSTM pour tous les tickers du dashboard.

Lancer une seule fois au début (ou une fois par semaine pour re-entraîner) :
    python train_all.py
"""
from config import TICKERS
from train import train

print("=" * 50)
print("  🚀 Entraînement de tous les modèles")
print("=" * 50)

results = []
for ticker in TICKERS:
    print(f"\n▶ {ticker}...")
    try:
        r = train(ticker)
        results.append({"ticker": ticker, "status": "✅", "val_accuracy": r["val_accuracy"]})
    except Exception as e:
        results.append({"ticker": ticker, "status": "❌", "error": str(e)})

print("\n" + "=" * 50)
print("  📊 Résultats")
print("=" * 50)
for r in results:
    if r["status"] == "✅":
        print(f"  {r['status']} {r['ticker']:<10} → val_accuracy={r['val_accuracy']:.2%}")
    else:
        print(f"  {r['status']} {r['ticker']:<10} → Erreur: {r['error']}")
print("=" * 50)
print("\n✅ Terminé ! Lance maintenant : uvicorn api:app --reload --port 8000")
