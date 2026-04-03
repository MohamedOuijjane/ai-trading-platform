import pytest
import pandas as pd
import numpy as np
from services.indicator_service import add_indicators

def test_add_indicators():
    # Create a dummy OHLCV dataframe
    data = {
        "Open":   np.linspace(100, 110, 100),
        "High":   np.linspace(105, 115, 100),
        "Low":    np.linspace(95, 105, 100),
        "Close":  np.linspace(100, 110, 100),
        "Volume": np.random.randint(1000, 5000, 100)
    }
    df = pd.DataFrame(data)
    
    # Add indicators
    df_with_indicators = add_indicators(df)
    
    # Check if all required indicators are present
    expected_cols = [
        "RSI", "MACD", "MACD_Signal", 
        "BB_Upper", "BB_Middle", "BB_Lower", 
        "EMA_20", "EMA_50"
    ]
    for col in expected_cols:
        assert col in df_with_indicators.columns
        # Indicators might have NaNs for the first few rows (warm-up period)
        # but shouldn't be all NaNs
        assert not df_with_indicators[col].isnull().all()

def test_rsi_calculation():
    # RSI of a steadily increasing series should be 100
    close = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] * 10)
    from services.indicator_service import compute_rsi
    rsi = compute_rsi(close)
    # The last RSI value should be very high
    assert rsi.iloc[-1] > 90
