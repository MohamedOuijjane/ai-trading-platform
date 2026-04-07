import os
import yfinance as yf
# 🔧 FIX for yfinance 'unable to open database file' on Windows: relocate cache
try:
    cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "yfinance")
    os.makedirs(cache_dir, exist_ok=True)
    yf.set_tz_cache_location(cache_dir)
except Exception:
    pass

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
        # 🔧 FIX for yfinance 'unable to open database file' error: disable local caching
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

        # 🔧 FIX 4 — Prevent silent column filtering in data pipeline
        # ❌ BUG: silently drops missing features
        # available = [c for c in settings.FEATURE_COLS if c in df.columns]
        # # ❌ BUG: removes 'Close' column → breaks price extraction
        # # df = df[available]
        #
        # # ✅ FIX: keep 'Close' for price extraction
        # df = df[available + ["Close"]] if "Close" not in available else df[available]

        # ✅ FIX: enforce strict schema
        missing = [c for c in settings.FEATURE_COLS if c not in df.columns]
        if missing:
            raise ValueError(f"Missing features in cleaned data: {missing}")

        # Keep features + Close for extraction
        cols_to_keep = settings.FEATURE_COLS + (["Close"] if "Close" not in settings.FEATURE_COLS else [])
        df = df[cols_to_keep]

        # 🔧 FIX 5 — Add NaN validation in data_service.py
        if df.isnull().any().any():
            logger.error(f"NaN values detected in feature dataset for {ticker}")
            raise ValueError(f"NaN values detected in feature dataset for {ticker}")

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
