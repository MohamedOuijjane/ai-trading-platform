"""
utils.py – Shared technical-indicator helpers and scaling utilities.
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import pickle, os
from core.config import settings


# ─────────────────────────────────────────────────────────────────────────────
# Technical Indicators
# ─────────────────────────────────────────────────────────────────────────────

def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index."""
    delta = series.diff()
    gain  = delta.clip(lower=0)
    loss  = (-delta).clip(lower=0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs  = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.rename("RSI")


def compute_macd(series: pd.Series,
                 fast: int = 12, slow: int = 26, signal: int = 9
                 ) -> pd.DataFrame:
    """MACD line + Signal line."""
    ema_fast   = series.ewm(span=fast,   adjust=False).mean()
    ema_slow   = series.ewm(span=slow,   adjust=False).mean()
    macd_line  = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    return pd.DataFrame({"MACD": macd_line, "MACD_Signal": signal_line})


def compute_bollinger_bands(series: pd.Series,
                            period: int = 20, num_std: int = 2
                            ) -> pd.DataFrame:
    """Bollinger Bands: upper, middle (SMA), lower."""
    middle = series.rolling(period).mean()
    std    = series.rolling(period).std()
    return pd.DataFrame({
        "BB_Upper":  middle + num_std * std,
        "BB_Middle": middle,
        "BB_Lower":  middle - num_std * std,
    })


def compute_ema(series: pd.Series, span: int) -> pd.Series:
    """Exponential Moving Average."""
    return series.ewm(span=span, adjust=False).mean().rename(f"EMA_{span}")


def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Append all technical indicators to the OHLCV dataframe."""
    close = df["Close"]

    df["RSI"]        = compute_rsi(close)
    df[["MACD", "MACD_Signal"]] = compute_macd(close)
    df[["BB_Upper", "BB_Middle", "BB_Lower"]] = compute_bollinger_bands(close)
    df["EMA_20"]     = compute_ema(close, 20)
    df["EMA_50"]     = compute_ema(close, 50)

    return df


# ─────────────────────────────────────────────────────────────────────────────
# Scaling
# ─────────────────────────────────────────────────────────────────────────────

def fit_and_save_scaler(data: np.ndarray, ticker: str = "AAPL") -> MinMaxScaler:
    """Fit a MinMaxScaler, save to disk per ticker, and return it."""
    scaler = MinMaxScaler()
    scaler.fit(data)
    
    # ❌ BUG: Shared scaler path causes ticker overwriting
    # os.makedirs(os.path.dirname(SCALER_PATH), exist_ok=True)
    # with open(SCALER_PATH, "wb") as f:
    #     pickle.dump(scaler, f)
    
    # ✅ FIX: Ticker-specific scaler path
    scaler_path = settings.SCALER_PATH_TEMPLATE.format(ticker=ticker.upper())
    os.makedirs(os.path.dirname(scaler_path), exist_ok=True)
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    return scaler


def load_scaler(ticker: str = "AAPL") -> MinMaxScaler:
    """Load the saved MinMaxScaler from disk per ticker."""
    # ❌ BUG: Fixed path loads wrong scaler for most tickers
    # with open(SCALER_PATH, "rb") as f:
    #     return pickle.load(f)
    
    # ✅ FIX: Ticker-specific scaler path
    scaler_path = settings.SCALER_PATH_TEMPLATE.format(ticker=ticker.upper())
    with open(scaler_path, "rb") as f:
        return pickle.load(f)


def scale(scaler: MinMaxScaler, data: np.ndarray) -> np.ndarray:
    return scaler.transform(data)


def inverse_scale(scaler: MinMaxScaler, data: np.ndarray) -> np.ndarray:
    return scaler.inverse_transform(data)


# ─────────────────────────────────────────────────────────────────────────────
# Sequence builder
# ─────────────────────────────────────────────────────────────────────────────

def build_sequences(data: np.ndarray, seq_len: int):
    """
    Convert a 2-D array of shape (n_samples, n_features) into
    X of shape (n, seq_len, n_features) and y of shape (n,).
    Label: 1 if Close[t+1] > Close[t], else 0.
    """
    close_idx = 3   # "Close" is the 4th column in FEATURE_COLS
    X, y = [], []
    for i in range(seq_len, len(data) - 1):
        X.append(data[i - seq_len: i])
        label = 1 if data[i + 1, close_idx] > data[i, close_idx] else 0
        y.append(label)
    return np.array(X), np.array(y)
