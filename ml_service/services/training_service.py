import os
import numpy as np
import pickle
from typing import Dict, Any, Optional
from core.config import settings
from core.logging_config import logger
from services.data_service import get_clean_data
from services.indicator_service import add_indicators

def build_sequences(data: np.ndarray, seq_len: int, feature_cols: list):
    """
    Convert a 2-D array of shape (n_samples, n_features) into
    X of shape (n, seq_len, n_features) and y of shape (n,).
    
    3-CLASS TARGET ENGINEERING:
    - SELL: pct_change < -threshold (Label 0)
    - HOLD: -threshold <= pct_change <= threshold (Label 1)
    - BUY:  pct_change > threshold (Label 2)
    """
    try:
        close_idx = feature_cols.index("Close")
    except ValueError:
        logger.error(f"'Close' column not found in feature_cols: {feature_cols}")
        raise ValueError("'Close' column is required for sequence building.")

    X, y = [], []
    threshold = settings.PCT_CHANGE_THRESHOLD

    for i in range(seq_len, len(data) - 1):
        X.append(data[i - seq_len: i])
        
        # Calculate percentage change for the NEXT candle
        current_close = data[i, close_idx]
        next_close = data[i + 1, close_idx]
        pct_change = (next_close - current_close) / current_close
        
        if pct_change > threshold:
            label = 2  # BUY
        elif pct_change < -threshold:
            label = 0  # SELL
        else:
            label = 1  # HOLD
            
        y.append(label)
        
    return np.array(X), np.array(y)

def build_model(seq_len: int, n_features: int):
    """Build and compile the LSTM model for 3-class classification."""
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import (
        LSTM, Dense, Dropout, BatchNormalization, Input
    )

    model = Sequential([
        Input(shape=(seq_len, n_features)),
        LSTM(settings.LSTM_UNITS, return_sequences=True),
        BatchNormalization(),
        Dropout(settings.DROPOUT_RATE),
        LSTM(settings.LSTM_UNITS // 2, return_sequences=False),
        BatchNormalization(),
        Dropout(settings.DROPOUT_RATE),
        Dense(64, activation="relu"),
        Dense(settings.NUM_CLASSES, activation="softmax"),   # 3 classes output
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",             # For multi-class integer labels
        metrics=["accuracy"],
    )
    return model

def train(ticker: str,
          epochs: Optional[int] = None,
          batch_size: int = settings.BATCH_SIZE) -> dict:
    """
    Full training pipeline with RobustScaler and enhanced metrics.
    """
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
    from sklearn.preprocessing import RobustScaler
    from sklearn.metrics import classification_report, accuracy_score
    from sklearn.utils.class_weight import compute_class_weight
    from services.backtesting_service import run_backtest

    epochs = epochs if epochs is not None else settings.EPOCHS
    ticker = ticker.upper()
    logger.info(f"Starting training for {ticker} … (epochs={epochs})")

    try:
        # ── 1. Data ───────────────────────────────────────────────────────────────
        df = get_clean_data(ticker, period=settings.DEFAULT_PERIOD, save_csv=True)
        feature_cols = [c for c in settings.FEATURE_COLS if c in df.columns]
        data_raw = df[feature_cols].values.astype(np.float32)

        # --- SANITY CHECKS ---
        if np.isnan(data_raw).any():
            logger.error(f"NaN detected in input data for {ticker}")
            raise ValueError("NaN detected in input data")
        
        if len(data_raw) < settings.SEQUENCE_LENGTH + 10:
            logger.error(f"Not enough data for training {ticker}: need {settings.SEQUENCE_LENGTH + 10}, got {len(data_raw)}")
            raise ValueError("Not enough data for training")

        # ── 2. Scale (RobustScaler) - AVOID DATA LEAKAGE ─────────────────────────
        # Split raw data BEFORE fitting the scaler
        split_idx = int(len(data_raw) * (1 - settings.VALIDATION_SPLIT))
        train_raw = data_raw[:split_idx]
        
        scaler = RobustScaler()
        scaler.fit(train_raw)  # Fit ONLY on training data
        
        data_scaled = scaler.transform(data_raw)  # Transform full dataset
        
        scaler_path = settings.SCALER_PATH_TEMPLATE.format(ticker=ticker)
        os.makedirs(os.path.dirname(scaler_path), exist_ok=True)
        with open(scaler_path, "wb") as f:
            pickle.dump(scaler, f)
        logger.info(f"Saved RobustScaler to {scaler_path} (fitted on train only)")

        # ── 3. Sequences ─────────────────────────────────────────────────────────
        X, y = build_sequences(data_scaled, settings.SEQUENCE_LENGTH, feature_cols)
        
        # --- CLASS IMBALANCE HANDLING ---
        unique, counts = np.unique(y, return_counts=True)
        class_dist = dict(zip(unique, counts))
        logger.info(f"Class distribution for {ticker}: {class_dist}")

        # ── 4. Train/Val split (chronological) ───────────────────────────────────
        split = int(len(X) * (1 - settings.VALIDATION_SPLIT))
        X_train, X_val = X[:split], X[split:]
        y_train, y_val = y[:split], y[split:]

        # Compute class weights for balanced training
        classes = np.unique(y_train)
        weights = compute_class_weight(class_weight="balanced", classes=classes, y=y_train)
        class_weights_dict = dict(zip(classes, weights))
        logger.info(f"Computed class weights: {class_weights_dict}")

        # ── 5. Model ─────────────────────────────────────────────────────────────
        model = build_model(settings.SEQUENCE_LENGTH, len(feature_cols))
        
        model_path = settings.MODEL_PATH_TEMPLATE.format(ticker=ticker)
        os.makedirs(os.path.dirname(model_path), exist_ok=True)

        callbacks = [
            EarlyStopping(
                monitor="val_loss", patience=7,
                restore_best_weights=True, verbose=0
            ),
            ModelCheckpoint(
                model_path, monitor="val_accuracy",
                save_best_only=True, verbose=0
            ),
        ]

        history = model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            class_weight=class_weights_dict,
            verbose=0,
        )

        # ── 6. Evaluate with detailed metrics ─────────────────────────────────────
        y_pred_probs = model.predict(X_val, verbose=0)
        y_pred = np.argmax(y_pred_probs, axis=1)
        
        # --- CONFIDENCE ANALYSIS ---
        confidences = np.max(y_pred_probs, axis=1)
        avg_conf = float(np.mean(confidences))
        
        acc = accuracy_score(y_val, y_pred)
        report = classification_report(y_val, y_pred, output_dict=True, zero_division=0)

        # --- PER-CLASS METRICS ---
        per_class = {
            "SELL": report.get("0", {}),
            "HOLD": report.get("1", {}),
            "BUY":  report.get("2", {}),
        }
        logger.info(f"Per-class metrics for {ticker}: SELL(P={per_class['SELL'].get('precision', 0):.2f}, R={per_class['SELL'].get('recall', 0):.2f}) | BUY(P={per_class['BUY'].get('precision', 0):.2f}, R={per_class['BUY'].get('recall', 0):.2f})")

        # --- BACKTEST INTEGRATION ---
        try:
            backtest = run_backtest(ticker)
        except Exception as be:
            logger.error(f"Auto-backtest failed for {ticker}: {be}")
            backtest = {"total_return_pct": 0, "win_rate_pct": 0, "max_drawdown_pct": 0}

        result = {
            "ticker":       ticker,
            "epochs_run":   len(history.history["loss"]),
            "accuracy":     round(acc, 4),
            "precision":    round(report["weighted avg"]["precision"], 4),
            "recall":       round(report["weighted avg"]["recall"], 4),
            "f1_score":     round(report["weighted avg"]["f1-score"], 4),
            "avg_confidence": round(avg_conf, 4),
            "val_loss":     round(float(history.history["val_loss"][-1]), 4),
            "per_class":    per_class,
            "roi":          backtest.get("total_return_pct", 0),
            "win_rate":     backtest.get("win_rate_pct", 0),
            "max_drawdown": backtest.get("max_drawdown_pct", 0),
            "model_path":   model_path,
        }
        
        logger.info(f"Done → Accuracy={result['accuracy']:.4f} F1={result['f1_score']:.4f} ROI={result['roi']}%")
        return result
    except Exception as e:
        logger.error(f"Training failed for {ticker}: {e}", exc_info=True)
        raise
