import os
import yfinance as yf
import pandas as pd
from typing import Optional
from core.config import settings
from services.indicator_service import add_indicators
from core.logging_config import logger

def get_clean_data(
    ticker: str,
    period: str = settings.DEFAULT_PERIOD,
    interval: str = settings.DEFAULT_INTERVAL,
    save_csv: bool = False,
) -> pd.DataFrame:
    """
    Download OHLCV data for `ticker`, apply technical indicators,
    drop NaN rows, and return a clean DataFrame.
    """
    try:
        # ── 1. Download ──────────────────────────────────────────────────────────
        logger.info(f"Downloading data for {ticker} (period={period}, interval={interval})")
        raw = yf.download(ticker, period=period, interval=interval, progress=False)

        if raw.empty:
            logger.error(f"No data returned for ticker '{ticker}' from yfinance.")
            raise ValueError(f"No data returned for ticker '{ticker}'.")

        # Flatten multi-level columns if present
        if isinstance(raw.columns, pd.MultiIndex):
            raw.columns = raw.columns.get_level_values(0)

        # Keep only standard OHLCV columns
        raw = raw[["Open", "High", "Low", "Close", "Volume"]].copy()

        # ── 2. Clean ─────────────────────────────────────────────────────────────
        raw.ffill(inplace=True)
        raw.bfill(inplace=True)

        # ── 3. Feature engineering ───────────────────────────────────────────────
        df = add_indicators(raw)
        df.dropna(inplace=True)

        # Ensure only declared feature columns are present
        available = [c for c in settings.FEATURE_COLS if c in df.columns]
        df = df[available]

        # ── 4. Optionally persist ─────────────────────────────────────────────────
        if save_csv:
            os.makedirs(settings.DATA_DIR, exist_ok=True)
            path = os.path.join(settings.DATA_DIR, f"{ticker}.csv")
            df.to_csv(path)
            logger.info(f"Saved cleaned data to {path}")

        return df
    except Exception as e:
        logger.error(f"Failed to fetch or clean data for {ticker}: {e}", exc_info=True)
        raise
