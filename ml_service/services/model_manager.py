import os
import pickle
import numpy as np
import threading
from typing import Dict, Any, Optional
from core.config import settings
from core.logging_config import logger
from sklearn.preprocessing import MinMaxScaler

class ModelManager:
    """Manages loading and caching of models and scalers with thread safety."""
    
    def __init__(self):
        self._models: Dict[str, Any] = {}
        self._scalers: Dict[str, MinMaxScaler] = {}
        self._lock = threading.Lock()

    def _get_model_path(self, ticker: str) -> str:
        return settings.MODEL_PATH_TEMPLATE.format(ticker=ticker.upper())

    def _get_scaler_path(self, ticker: str) -> str:
        return settings.SCALER_PATH_TEMPLATE.format(ticker=ticker.upper())

    def load_model(self, ticker: str) -> Any:
        """Load a Keras model for a specific ticker with locking."""
        ticker = ticker.upper()
        
        # Double-checked locking pattern
        if ticker in self._models:
            return self._models[ticker]

        with self._lock:
            if ticker in self._models:
                return self._models[ticker]

            model_path = self._get_model_path(ticker)
            generic_model_path = os.path.join(settings.MODEL_DIR, "lstm_model.keras")
            final_path = model_path if os.path.exists(model_path) else generic_model_path
            
            if not os.path.exists(final_path):
                logger.error(f"Model for {ticker} not found at {model_path} or {generic_model_path}")
                raise FileNotFoundError(f"Model for {ticker} not found.")

            try:
                from tensorflow.keras.models import load_model
                #from keras.models import load_model
                logger.info(f"Loading model for {ticker} from {final_path}")
                model = load_model(final_path)
                self._models[ticker] = model
                return model
            except Exception as e:
                logger.error(f"Failed to load model for {ticker}: {e}", exc_info=True)
                raise

    def load_scaler(self, ticker: str) -> MinMaxScaler:
        """Load a MinMaxScaler for a specific ticker with locking."""
        ticker = ticker.upper()
        
        # Double-checked locking pattern
        if ticker in self._scalers:
            return self._scalers[ticker]

        with self._lock:
            if ticker in self._scalers:
                return self._scalers[ticker]

            # 🔧 FIX 1 — Enforce scaler existence in model_manager.py
            scaler_path = settings.SCALER_PATH_TEMPLATE.format(ticker=ticker.upper())
            
            if not os.path.exists(scaler_path):
                logger.error(f"Scaler for {ticker} not found at {scaler_path}")
                raise FileNotFoundError(f"Scaler not found for {ticker}: {scaler_path}")

            # 🔧 FIX 7 — Ensure scaler and model alignment
            from utils import load_scaler
            try:
                logger.info(f"Loading scaler for {ticker} from {scaler_path}")
                scaler = load_scaler(ticker)
                self._scalers[ticker] = scaler
                print(f"[DEBUG] Loaded model + scaler for {ticker}")
                return scaler
            except Exception as e:
                logger.error(f"Failed to load scaler for {ticker}: {e}", exc_info=True)
                raise

    def preload_models(self):
        """Preload models and scalers for all configured tickers."""
        for ticker in settings.TICKERS:
            try:
                self.load_model(ticker)
                self.load_scaler(ticker)
            except (FileNotFoundError, Exception):
                logger.warning(f"Could not preload model/scaler for {ticker}")

# Global instance for easy import and singleton usage
model_manager = ModelManager()
