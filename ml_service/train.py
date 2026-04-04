"""
train.py – Train an LSTM model to predict stock price direction.

Usage:
    python train.py --ticker AAPL
    python train.py --ticker BTC-USD --epochs 50
"""
import argparse
import os
import numpy as np
import pickle

from config import (
    DEFAULT_TICKER, SEQUENCE_LENGTH, LSTM_UNITS, DROPOUT_RATE,
    EPOCHS, BATCH_SIZE, VALIDATION_SPLIT, MODEL_PATH, MODEL_DIR, FEATURE_COLS,
)
from data_collector import get_clean_data
from utils import fit_and_save_scaler, build_sequences


def build_model(seq_len: int, n_features: int):
    """Build and compile the LSTM model."""
    # Import here so the file can be imported without TF installed
    import tensorflow as tf
    from keras.models import Sequential
    from keras.layers import (
        LSTM, Dense, Dropout, BatchNormalization, Input
    )

    model = Sequential([
        Input(shape=(seq_len, n_features)),
        LSTM(LSTM_UNITS, return_sequences=True),
        BatchNormalization(),
        Dropout(DROPOUT_RATE),
        LSTM(LSTM_UNITS // 2, return_sequences=False),
        BatchNormalization(),
        Dropout(DROPOUT_RATE),
        Dense(32, activation="relu"),
        Dense(1, activation="sigmoid"),   # output = P(price goes UP)
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    return model


def train(ticker: str = DEFAULT_TICKER,
          epochs: int = EPOCHS,
          batch_size: int = BATCH_SIZE) -> dict:
    """
    Full training pipeline.

    Returns
    -------
    dict with 'val_accuracy' and 'val_loss' of the best epoch.
    """
    from keras.callbacks import EarlyStopping, ModelCheckpoint

    print(f"\n[train] Starting training for {ticker} …")

    # ── 1. Data ───────────────────────────────────────────────────────────────
    df = get_clean_data(ticker, save_csv=True)
    feature_cols = [c for c in FEATURE_COLS if c in df.columns]
    data_raw = df[feature_cols].values.astype(np.float32)

    # ── 2. Scale ─────────────────────────────────────────────────────────────
    scaler   = fit_and_save_scaler(data_raw)
    data_scaled = scaler.transform(data_raw)

    # ── 3. Sequences ─────────────────────────────────────────────────────────
    X, y = build_sequences(data_scaled, SEQUENCE_LENGTH)
    print(f"[train] Dataset → X: {X.shape}, y: {y.shape}  "
          f"(BUY={y.sum()}, SELL={len(y)-y.sum()})")

    # ── 4. Train/Val split (chronological) ───────────────────────────────────
    split = int(len(X) * (1 - VALIDATION_SPLIT))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    # ── 5. Model ─────────────────────────────────────────────────────────────
    model = build_model(SEQUENCE_LENGTH, len(feature_cols))
    model.summary()

    os.makedirs(MODEL_DIR, exist_ok=True)

    callbacks = [
        EarlyStopping(
            monitor="val_loss", patience=5,
            restore_best_weights=True, verbose=1
        ),
        ModelCheckpoint(
            MODEL_PATH, monitor="val_accuracy",
            save_best_only=True, verbose=1
        ),
    ]

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1,
    )

    # ── 6. Evaluate ───────────────────────────────────────────────────────────
    best_epoch = int(np.argmax(history.history["val_accuracy"]))
    result = {
        "ticker":       ticker,
        "epochs_run":   len(history.history["loss"]),
        "val_accuracy": round(float(history.history["val_accuracy"][best_epoch]), 4),
        "val_loss":     round(float(history.history["val_loss"][best_epoch]), 4),
        "model_path":   MODEL_PATH,
    }
    print(f"\n[train] Done → val_accuracy={result['val_accuracy']:.4f}  "
          f"val_loss={result['val_loss']:.4f}")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train LSTM trading model")
    parser.add_argument("--ticker", default=DEFAULT_TICKER)
    parser.add_argument("--epochs", type=int, default=EPOCHS)
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE)
    args = parser.parse_args()

    result = train(args.ticker, args.epochs, args.batch_size)
    print(result)
