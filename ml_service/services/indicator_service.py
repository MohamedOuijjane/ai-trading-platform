import numpy as np
import pandas as pd
from typing import List

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

def compute_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
    """MACD line + Signal line."""
    ema_fast   = series.ewm(span=fast,   adjust=False).mean()
    ema_slow   = series.ewm(span=slow,   adjust=False).mean()
    macd_line  = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    return pd.DataFrame({"MACD": macd_line, "MACD_Signal": signal_line})

def compute_bollinger_bands(series: pd.Series, period: int = 20, num_std: int = 2) -> pd.DataFrame:
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

def compute_sma(series: pd.Series, period: int) -> pd.Series:
    """Simple Moving Average."""
    return series.rolling(window=period).mean().rename(f"SMA_{period}")

def compute_roc(series: pd.Series, period: int = 12) -> pd.Series:
    """Rate of Change."""
    return ((series - series.shift(period)) / series.shift(period) * 100).rename("ROC")

def compute_stochastic(df: pd.DataFrame, k_period: int = 14, d_period: int = 3) -> pd.DataFrame:
    """Stochastic Oscillator (%K, %D)."""
    low_min = df["Low"].rolling(window=k_period).min()
    high_max = df["High"].rolling(window=k_period).max()
    
    k_line = 100 * (df["Close"] - low_min) / (high_max - low_min)
    d_line = k_line.rolling(window=d_period).mean()
    
    return pd.DataFrame({"Stoch_K": k_line, "Stoch_D": d_line})

def compute_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Average True Range."""
    high_low = df["High"] - df["Low"]
    high_cp = (df["High"] - df["Close"].shift(1)).abs()
    low_cp = (df["Low"] - df["Close"].shift(1)).abs()
    
    tr = pd.concat([high_low, high_cp, low_cp], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr.rename("ATR")

def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Append enhanced technical indicators to the OHLCV dataframe."""
    close = df["Close"]
    volume = df["Volume"]

    # --- Trend Features ---
    df["RSI"]        = compute_rsi(close)
    df[["MACD", "MACD_Signal"]] = compute_macd(close)
    df[["BB_Upper", "BB_Middle", "BB_Lower"]] = compute_bollinger_bands(close)
    df["EMA_20"]     = compute_ema(close, 20)
    df["EMA_50"]     = compute_ema(close, 50)
    
    df["SMA_10"] = compute_sma(close, 10)
    df["SMA_20"] = compute_sma(close, 20)
    df["SMA_50"] = compute_sma(close, 50)
    
    df["EMA_12"] = compute_ema(close, 12)
    df["EMA_26"] = compute_ema(close, 26)
    df["EMA_Diff"] = df["EMA_12"] - df["EMA_26"]

    # --- Momentum ---
    df["ROC"] = compute_roc(close)
    stoch = compute_stochastic(df)
    df["Stoch_K"] = stoch["Stoch_K"]
    df["Stoch_D"] = stoch["Stoch_D"]

    # --- Volatility ---
    df["ATR"] = compute_atr(df)
    df["Volatility_20"] = close.rolling(window=20).std()

    # --- Returns ---
    df["Daily_Return"] = close.pct_change()
    df["Log_Return"] = np.log(close / close.shift(1))

    # --- Volume Features ---
    df["Volume_SMA_20"] = volume.rolling(window=20).mean()
    df["Volume_Change_Pct"] = volume.pct_change()

    return df
