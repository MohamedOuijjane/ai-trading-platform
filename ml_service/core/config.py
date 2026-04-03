import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # ---------------------------------------------------------------------------
    # API Settings
    # ---------------------------------------------------------------------------
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Trading Bot – ML Service"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # ---------------------------------------------------------------------------
    # Tickers traded on the dashboard
    # ---------------------------------------------------------------------------
    TICKERS: List[str] = [
        "AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "BTC-USD", "ETH-USD"
    ]
    
    # ---------------------------------------------------------------------------
    # Paths
    # ---------------------------------------------------------------------------
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_DIR: str = os.path.join(BASE_DIR, "model")
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    
    # Template paths (actual paths will be ticker-specific)
    MODEL_PATH_TEMPLATE: str = os.path.join(MODEL_DIR, "{ticker}_lstm_model.keras")
    SCALER_PATH_TEMPLATE: str = os.path.join(MODEL_DIR, "{ticker}_scaler.pkl")
    
    # ---------------------------------------------------------------------------
    # Data settings
    # ---------------------------------------------------------------------------
    DEFAULT_TICKER: str = "AAPL"
    DEFAULT_PERIOD: str = "5y"        # Increased from 2y to 5y
    DEFAULT_INTERVAL: str = "1d"
    SEQUENCE_LENGTH: int = 100        # Increased from 60 to 100
    
    # ---------------------------------------------------------------------------
    # Feature columns used by the model (Refined for quality)
    # ---------------------------------------------------------------------------
    FEATURE_COLS: List[str] = [
        "Open", "High", "Low", "Close", "Volume",
        "RSI", "MACD", "MACD_Signal",
        "BB_Upper", "BB_Lower", "BB_Middle",
        "EMA_20", "EMA_50",
        "SMA_10", "SMA_20", "SMA_50",
        "EMA_12", "EMA_26", "EMA_Diff",
        "ROC", "Stoch_K", "Stoch_D",
        "ATR", "Volatility_20",
        "Daily_Return", "Log_Return",
        "Volume_SMA_20", "Volume_Change_Pct"
    ]
    
    # ---------------------------------------------------------------------------
    # LSTM hyper-parameters
    # ---------------------------------------------------------------------------
    LSTM_UNITS: int = 128             # Increased from 64 to 128
    DROPOUT_RATE: float = 0.3         # Slightly increased from 0.2 to 0.3
    EPOCHS: int = 50                  # Increased from 30 to 50
    BATCH_SIZE: int = 32
    VALIDATION_SPLIT: float = 0.1
    NUM_CLASSES: int = 3              # 0: SELL, 1: HOLD, 2: BUY
    
    # ---------------------------------------------------------------------------
    # Signal thresholds (Target Engineering)
    # ---------------------------------------------------------------------------
    PCT_CHANGE_THRESHOLD: float = 0.003  # 0.3% threshold for BUY/SELL
    
    # ---------------------------------------------------------------------------
    # Caching
    # ---------------------------------------------------------------------------
    PREDICTION_CACHE_TTL: int = int(os.getenv("PREDICTION_CACHE_TTL", "300"))

    class Config:
        case_sensitive = True

settings = Settings()
