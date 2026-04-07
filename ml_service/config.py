"""
config.py – Central configuration for the ML service.
"""

# ---------------------------------------------------------------------------
# Tickers traded on the dashboard
# ---------------------------------------------------------------------------
TICKERS = [
    "AAPL",     # Apple
    "TSLA",     # Tesla
    "NVDA",     # NVIDIA
    "MSFT",     # Microsoft
    "GOOGL",    # Google
    "AMZN",     # Amazon
    "BTC-USD",  # Bitcoin
    "ETH-USD",  # Ethereum
]
import os

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR  = os.path.join(BASE_DIR, "model")
DATA_DIR   = os.path.join(BASE_DIR, "data")

MODEL_PATH  = os.path.join(MODEL_DIR, "lstm_model.keras")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

# ---------------------------------------------------------------------------
# Data settings
# ---------------------------------------------------------------------------
DEFAULT_TICKER  = "AAPL"
DEFAULT_PERIOD  = "2y"        # how much history to download for training
DEFAULT_INTERVAL = "1d"       # candle interval
SEQUENCE_LENGTH = 60          # look-back window fed into LSTM

# ---------------------------------------------------------------------------
# Feature columns used by the model
# ---------------------------------------------------------------------------
#FEATURE_COLS = [
#    "Open", "High", "Low", "Close", "Volume",
#    "RSI", "MACD", "MACD_Signal",
#    "BB_Upper", "BB_Lower", "BB_Middle",
#    "EMA_20", "EMA_50",
#]
FEATURE_COLS = [
    "Open", "High", "Low", "Close", "Volume",
    "RSI", "MACD", "MACD_Signal",
    "BB_Upper", "BB_Lower", "BB_Middle",
    "EMA_20", "EMA_50",
    "SMA_10", "SMA_20", "SMA_50",
    "EMA_12", "EMA_26", "EMA_Diff",
    "ROC", "Stoch_K", "Stoch_D",
    "ATR", "Volatility_20",
    "Daily_Return", "Log_Return",
    "Volume_SMA_20", "Volume_Change_Pct",
]
# ---------------------------------------------------------------------------
# LSTM hyper-parameters
# ---------------------------------------------------------------------------
LSTM_UNITS   = 64
DROPOUT_RATE = 0.2
EPOCHS       = 30
BATCH_SIZE   = 32
VALIDATION_SPLIT = 0.1

# ---------------------------------------------------------------------------
# Signal thresholds
# ---------------------------------------------------------------------------
BUY_THRESHOLD  = 0.55   # predicted probability > this → BUY
SELL_THRESHOLD = 0.45   # predicted probability < this → SELL
