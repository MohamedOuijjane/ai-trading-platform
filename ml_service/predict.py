"""
predict.py – Load a trained LSTM model and generate trading signals.

Usage:
    python predict.py --ticker AAPL
"""
import argparse
import os
import numpy as np
from datetime import datetime

from config import (
    DEFAULT_TICKER, SEQUENCE_LENGTH, MODEL_PATH, SCALER_PATH,
    FEATURE_COLS, BUY_THRESHOLD, SELL_THRESHOLD,
)
from data_collector import get_clean_data
from utils import load_scaler


def _load_model():
    """Load the Keras model from disk."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. "
            "Please run train.py first."
        )
    from tensorflow.keras.models import load_model
    return load_model(MODEL_PATH)


def get_prediction(ticker: str = DEFAULT_TICKER) -> dict:
    """
    Fetch the latest market data for `ticker` and return a trading signal.

    Returns
    -------
    {
        "ticker":     str,
        "signal":     "BUY" | "SELL" | "HOLD",
        "confidence": float  (0-1),
        "price":      float  (latest close price),
        "timestamp":  str    (ISO-8601 UTC),
    }
    """
    # ── 1. Load model & scaler ────────────────────────────────────────────────
    model  = _load_model()
    scaler = load_scaler()

    # ── 2. Get latest data ────────────────────────────────────────────────────
    # We need at least SEQUENCE_LENGTH rows after indicators warm-up (~50 rows)
    df = get_clean_data(ticker, period="6mo")

    feature_cols = [c for c in FEATURE_COLS if c in df.columns]
    latest_price = float(df["Close"].iloc[-1])

    # ── 3. Prepare sequence ───────────────────────────────────────────────────
    data_raw    = df[feature_cols].values.astype(np.float32)
    data_scaled = scaler.transform(data_raw)

    if len(data_scaled) < SEQUENCE_LENGTH:
        raise ValueError(
            f"Not enough data for {ticker}: "
            f"need {SEQUENCE_LENGTH} rows, got {len(data_scaled)}."
        )

    # Take the last SEQUENCE_LENGTH candles as one input sequence
    seq = data_scaled[-SEQUENCE_LENGTH:]                  # (60, n_features)
    X   = np.expand_dims(seq, axis=0)                    # (1, 60, n_features)

    # ── 4. Predict ────────────────────────────────────────────────────────────
    prob = float(model.predict(X, verbose=0)[0][0])      # P(price goes UP)

    if prob > BUY_THRESHOLD:
        signal = "BUY"
    elif prob < SELL_THRESHOLD:
        signal = "SELL"
    else:
        signal = "HOLD"

    result = {
        "ticker":     ticker,
        "signal":     signal,
        "confidence": round(prob, 4),
        "price":      round(latest_price, 4),
        "timestamp":  datetime.utcnow().isoformat() + "Z",
    }
    print(f"[predict] {ticker} → {signal}  (confidence={prob:.4f}, price={latest_price:.2f})")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Get a trading signal from the trained LSTM")
    parser.add_argument("--ticker", default=DEFAULT_TICKER)
    args = parser.parse_args()
    print(get_prediction(args.ticker))
