from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List, Optional
import os
import time
from core.schemas import (
    PredictionRequest, PredictionResponse, TrainRequest, TrainResponse,
    HealthResponse, MetricsResponse, ErrorResponse
)
from core.config import settings
from core.logging_config import logger
from services.prediction_service import get_prediction, prediction_cache
from services.training_service import train
from services.model_manager import model_manager
from services.backtesting_service import run_backtest
from services.metrics_tracker import get_accuracy_report

# ... (in existing router)

@router.get("/accuracy/{ticker}", tags=["Analysis"])
def get_accuracy(ticker: str):
    """
    Get accuracy stats for a specific ticker based on historical predictions.
    """
    ticker = ticker.upper().strip()
    return get_accuracy_report(ticker if ticker != "ALL" else None)

@router.get("/backtest/{ticker}", tags=["Analysis"])
def get_backtest(ticker: str):
    """
    Run a historical backtest for a specific ticker.
    Simulates trades and returns ROI, win rate, and drawdown.
    """
    ticker = ticker.upper().strip()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker cannot be empty")
        
    try:
        result = run_backtest(ticker)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail=f"Model not found for {ticker}. Please train first.")
    except Exception as e:
        logger.error(f"Backtest error for {ticker}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during backtest.")

# Simple global stats for /metrics
STATS = {
    "total_predictions": 0,
    "total_training_runs": 0,
    "cache_hits": 0,
    "latencies": [], # Keep last 100 latencies
}

@router.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """Detailed health check including loaded models."""
    # Check if at least one model exists on disk
    model_exists = any(os.path.exists(settings.MODEL_PATH_TEMPLATE.format(ticker=t)) for t in settings.TICKERS)
    # Get actually loaded models in memory
    loaded_models = list(model_manager._models.keys())
    
    return HealthResponse(
        status="ok",
        model_ready=model_exists,
        models_loaded=loaded_models,
        version="1.1.0",
        uptime=time.monotonic()
    )

@router.get("/metrics", response_model=MetricsResponse, tags=["System"])
def get_metrics():
    """Return service performance metrics."""
    avg_latency = sum(STATS["latencies"]) / len(STATS["latencies"]) if STATS["latencies"] else 0.0
    
    return MetricsResponse(
        total_predictions=STATS["total_predictions"],
        total_training_runs=STATS["total_training_runs"],
        cache_hits=STATS["cache_hits"],
        average_latency_ms=round(avg_latency, 2)
    )

@router.get("/predict/{ticker}", response_model=PredictionResponse, responses={503: {"model": ErrorResponse}, 422: {"model": ErrorResponse}}, tags=["Prediction"])
def predict_ticker(ticker: str):
    """
    Get BUY/SELL/HOLD signal for a specific ticker.
    Includes in-memory caching and latency tracking.
    """
    ticker = ticker.upper().strip()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker cannot be empty")
        
    start_time = time.time()
    try:
        STATS["total_predictions"] += 1
        
        # Check cache hit before calling prediction_service
        if ticker in prediction_cache:
            STATS["cache_hits"] += 1
            logger.info(f"METRIC: Cache HIT for {ticker}")
        else:
            logger.info(f"METRIC: Cache MISS for {ticker}")
            
        result = get_prediction(ticker)
        
        # Track latency
        latency = (time.time() - start_time) * 1000
        STATS["latencies"].append(latency)
        if len(STATS["latencies"]) > 100:
            STATS["latencies"].pop(0)
            
        return result
    except Exception as e:
        logger.error(f"Prediction error for {ticker}: {e}", exc_info=True)
        # Prediction service already handles fallbacks, but if something 
        # escapes it (like model manager failure before fallback), we return 500
        raise HTTPException(status_code=500, detail="Internal server error during prediction.")

@router.post("/train", response_model=TrainResponse, tags=["Training"])
async def trigger_training(request: TrainRequest, background_tasks: BackgroundTasks):
    """
    Trigger training for a specific ticker.
    Runs asynchronously as a background task.
    """
    ticker = request.ticker.upper().strip()
    
    # Check if already training (simplified)
    # In a real production app, use a Redis lock or similar
    
    # Function to run in background
    def background_train(t: str, e: Optional[int]):
        try:
            train(t, epochs=e)
            STATS["total_training_runs"] += 1
            # Invalidate cache after training
            from services.prediction_service import prediction_cache
            if t in prediction_cache:
                del prediction_cache[t]
        except Exception as err:
            logger.error(f"Background training failed for {t}: {err}")

    background_tasks.add_task(background_train, ticker, request.epochs)
    
    return TrainResponse(
        ticker=ticker,
        epochs_run=0, # Training just started
        accuracy=0.0,
        precision=0.0,
        recall=0.0,
        f1_score=0.0,
        val_loss=0.0,
        model_path="",
        status="accepted",
        message=f"Training for {ticker} started in background."
    )
