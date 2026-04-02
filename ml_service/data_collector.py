"""
data_collector.py – Download, clean and enrich market data via yfinance.
"""
import os
import yfinance as yf
import pandas as pd
from config import (
    DEFAULT_PERIOD, DEFAULT_INTERVAL, FEATURE_COLS, DATA_DIR
)
from utils import add_indicators


def get_clean_data(
    ticker: str = "AAPL",
    period: str = DEFAULT_PERIOD,
    interval: str = DEFAULT_INTERVAL,
    save_csv: bool = False,
) -> pd.DataFrame:
    """
    Download OHLCV data for `ticker`, apply technical indicators,
    drop NaN rows, and return a clean DataFrame.

    Parameters
    ----------
    ticker   : Stock / crypto symbol (e.g. "AAPL", "BTC-USD")
    period   : History length accepted by yfinance ("1y", "2y", "max" …)
    interval : Candle size ("1d", "1h", "5m" …)
    save_csv : If True, save the cleaned data to data/<ticker>.csv

    Returns
    -------
    pd.DataFrame with columns = FEATURE_COLS, indexed by Date.
    """
    # ── 1. Download ──────────────────────────────────────────────────────────
    raw = yf.download(ticker, period=period, interval=interval, progress=False)

    if raw.empty:
        raise ValueError(f"No data returned for ticker '{ticker}'.")

    # Flatten multi-level columns that yfinance sometimes returns
    if isinstance(raw.columns, pd.MultiIndex):
        raw.columns = raw.columns.get_level_values(0)

    # Keep only standard OHLCV columns
    raw = raw[["Open", "High", "Low", "Close", "Volume"]].copy()

    # ── 2. Clean ─────────────────────────────────────────────────────────────
    # Forward-fill gaps (weekends / holidays), then back-fill any leading NaN
    raw.ffill(inplace=True)
    raw.bfill(inplace=True)

    # ── 3. Feature engineering ───────────────────────────────────────────────
    df = add_indicators(raw)

    # Drop rows where any indicator is still NaN (warm-up period)
    df.dropna(inplace=True)

    # Ensure only our declared feature columns are present
    available = [c for c in FEATURE_COLS if c in df.columns]
    df = df[available]

    # ── 4. Optionally persist ─────────────────────────────────────────────────
    if save_csv:
        os.makedirs(DATA_DIR, exist_ok=True)
        path = os.path.join(DATA_DIR, f"{ticker}.csv")
        df.to_csv(path)
        print(f"[data_collector] Saved to {path}")

    print(
        f"[data_collector] {ticker}: {len(df)} rows, "
        f"{len(df.columns)} features → {list(df.columns)}"
    )
    return df


if __name__ == "__main__":
    df = get_clean_data("AAPL", save_csv=True)
    print(df.tail(5))
