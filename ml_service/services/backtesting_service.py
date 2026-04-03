import numpy as np
import pandas as pd
from typing import Dict, Any
from core.config import settings
from core.logging_config import logger
from services.data_service import get_clean_data
from services.model_manager import model_manager

def run_backtest(ticker: str, initial_capital: float = 10000.0) -> Dict[str, Any]:
    """
    Run a historical backtest for a specific ticker using the trained model.
    """
    ticker = ticker.upper()
    logger.info(f"Starting backtest for {ticker}...")

    try:
        # 1. Load Model & Scaler
        model = model_manager.load_model(ticker)
        scaler = model_manager.load_scaler(ticker)

        # 2. Get historical data (last 2 years for backtest)
        df = get_clean_data(ticker, period="2y")
        feature_cols = [c for c in settings.FEATURE_COLS if c in df.columns]
        
        # 3. Prepare data for prediction
        data_raw = df[feature_cols].values.astype(np.float32)
        data_scaled = scaler.transform(data_raw)
        
        prices = df["Close"].values
        dates = df.index.tolist()
        
        # 4. Simulation variables
        capital = initial_capital
        position = 0.0  # Amount of asset held
        trades = 0
        wins = 0
        
        # Track portfolio value over time
        portfolio_history = [initial_capital]
        
        # 5. Run simulation
        # Start from SEQUENCE_LENGTH to have enough history for the first prediction
        for i in range(settings.SEQUENCE_LENGTH, len(data_scaled)):
            # Get prediction for current day
            seq = data_scaled[i - settings.SEQUENCE_LENGTH : i]
            X = np.expand_dims(seq, axis=0)
            
            probs = model.predict(X, verbose=0)[0]
            signal_idx = np.argmax(probs)
            
            current_price = float(prices[i])
            
            # --- STRATEGY LOGIC ---
            # BUY (2)
            if signal_idx == 2 and position == 0:
                position = capital / current_price
                capital = 0
                trades += 1
                entry_price = current_price
                
            # SELL (0)
            elif signal_idx == 0 and position > 0:
                capital = position * current_price
                if current_price > entry_price:
                    wins += 1
                position = 0
                trades += 1
            
            # Track daily portfolio value
            current_value = capital + (position * current_price)
            portfolio_history.append(current_value)

        # Final portfolio value
        final_value = capital + (position * prices[-1])
        total_return = (final_value - initial_capital) / initial_capital
        
        # Calculate Max Drawdown
        portfolio_series = pd.Series(portfolio_history)
        cum_max = portfolio_series.cummax()
        drawdown = (portfolio_series - cum_max) / cum_max
        max_drawdown = drawdown.min()

        result = {
            "ticker": ticker,
            "initial_capital": initial_capital,
            "final_value": round(final_value, 2),
            "total_return_pct": round(total_return * 100, 2),
            "win_rate_pct": round((wins / (trades / 2) * 100), 2) if trades > 0 else 0,
            "total_trades": trades,
            "max_drawdown_pct": round(max_drawdown * 100, 2),
            "period": "2y"
        }

        logger.info(f"Backtest complete for {ticker} → Return: {result['total_return_pct']}%")
        return result

    except Exception as e:
        logger.error(f"Backtest failed for {ticker}: {e}", exc_info=True)
        raise
