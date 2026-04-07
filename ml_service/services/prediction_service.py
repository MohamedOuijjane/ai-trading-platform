import numpy as np
import time
from datetime import datetime
from typing import Dict, Any, Optional
from cachetools import TTLCache
from core.config import settings
from core.logging_config import logger
from core.schemas import PredictionResponse
from services.data_service import get_clean_data
from services.model_manager import model_manager

# Cache predictions for 5 minutes (TTL = settings.PREDICTION_CACHE_TTL)
prediction_cache = TTLCache(maxsize=100, ttl=settings.PREDICTION_CACHE_TTL)

def get_prediction(ticker: str) -> PredictionResponse:
    """
    Fetch the latest market data for `ticker` and return a trading signal.
    Uses in-memory caching for repeat requests.
    Includes robust validation and a safe fallback on failure.
    """
    ticker = ticker.upper()
    start_time = time.time()
    
    # Check cache first
    if ticker in prediction_cache:
        logger.info(f"Cache hit for ticker {ticker}")
        cached_result = prediction_cache[ticker]
        latency_ms = (time.time() - start_time) * 1000
        return PredictionResponse(
            **cached_result,
            latency_ms=round(latency_ms, 2)
        )

    try:
        # ── 1. Load model & scaler ────────────────────────────────────────────────
        model  = model_manager.load_model(ticker)
        scaler = model_manager.load_scaler(ticker)

        # ── 2. Get latest data ────────────────────────────────────────────────────
        df = get_clean_data(ticker, period="1y")

        # --- DATA VALIDATION LAYER ---
        if df.empty:
            logger.error(f"Dataframe is empty for {ticker}")
            raise ValueError(f"No market data available for {ticker}")

        if df.isnull().values.any():
            logger.warning(f"NaN values detected in data for {ticker}. Filling...")
            df = df.ffill().bfill()
            if df.isnull().values.any():
                raise ValueError(f"Persistent NaN values in data for {ticker}")

        if len(df) < settings.SEQUENCE_LENGTH:
            logger.error(f"Insufficient data for {ticker}: need {settings.SEQUENCE_LENGTH}, got {len(df)}")
            raise ValueError(f"Insufficient historical data for {ticker} (need {settings.SEQUENCE_LENGTH} rows)")

        # Ensure feature consistency
        # 🔧 FIX 2 — Add feature schema validation in prediction_service.py
        missing = [c for c in settings.FEATURE_COLS if c not in df.columns]
        
        if missing:
            logger.error(f"Missing features for {ticker}: {missing}")
            raise ValueError(f"Missing features in prediction input: {missing}")
        
        df = df[settings.FEATURE_COLS]

        latest_price = float(df["Close"].iloc[-1])

        # ── 3. Prepare sequence ───────────────────────────────────────────────────
        data_raw    = df[settings.FEATURE_COLS].values.astype(np.float32)
        data_scaled = scaler.transform(data_raw)

        # Take the last SEQUENCE_LENGTH candles as one input sequence
        seq = data_scaled[-settings.SEQUENCE_LENGTH:]                  # (100, n_features)
        X   = np.expand_dims(seq, axis=0)                             # (1, 100, n_features)

        # 🔧 FIX 6 — Add debug logs (temporary but important)
        print(f"[DEBUG] Input shape: {X.shape}")
        print(f"[DEBUG] Features used: {len(settings.FEATURE_COLS)}")

        # ── 4. Predict (Binary) ──────────────────────────────────────────────────
        # 🔧 FIX 3 — Enforce input shape before model.predict()
        if X.shape[2] != len(settings.FEATURE_COLS):
            raise ValueError(
                f"Feature mismatch: expected {len(settings.FEATURE_COLS)}, got {X.shape[2]}"
            )

        # ✅ FIX: correct binary interpretation
        # Binary model returns probability P(UP)
        prob = float(model.predict(X, verbose=0)[0][0])

        # Define thresholds for signal mapping
        if prob > 0.6:
            signal = "BUY"
        elif prob < 0.4:
            signal = "SELL"
        else:
            signal = "HOLD"

        result_dict = {
            "ticker":     ticker,
            "signal":     signal,
            "confidence": round(prob, 4),
            "price":      round(latest_price, 4),
            "timestamp":  datetime.utcnow().isoformat() + "Z",
        }
        
        # Cache the result dictionary
        prediction_cache[ticker] = result_dict
        
        latency_ms = (time.time() - start_time) * 1000
        
        # --- STRUCTURED LOGGING ---
        log_data = {
            "ticker":     ticker,
            "signal":     signal,
            "confidence": round(prob, 4),
            "price":      round(latest_price, 4),
            "latency":    round(latency_ms, 2)
        }
        logger.info(f"PREDICTION_RESULT: {log_data}")
        
        # Log low confidence predictions
        if prob < 0.55:
            logger.warning(f"LOW_CONFIDENCE_ALERT: {ticker} signal {signal} has confidence {prob:.4f} (< 0.55)")
        
        return PredictionResponse(
            **result_dict,
            latency_ms=round(latency_ms, 2)
        )
    except Exception as e:
        # 🔧 Fix 4 — Remove silent fallback in prediction_service.py
        logger.error(f"Prediction failed for {ticker}: {e}", exc_info=True)
        # --- SAFE PREDICTION FALLBACK ---
        # ❌ BUG: silent fallback returns 0.0 values
        # latency_ms = (time.time() - start_time) * 1000
        # return PredictionResponse(
        #     ticker=ticker,
        #     signal="HOLD",
        #     confidence=0.0,
        #     price=0.0,
        #     timestamp=datetime.utcnow().isoformat() + "Z",
        #     latency_ms=round(latency_ms, 2)
        # )

        # ✅ FIX: fail fast with RuntimeError
        raise RuntimeError(f"Prediction failed for {ticker}: {str(e)}")
