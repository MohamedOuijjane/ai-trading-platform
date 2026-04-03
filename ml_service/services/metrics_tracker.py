import os
import json
import time
from datetime import datetime
from typing import Dict, Any, List
from core.config import settings
from core.logging_config import logger

METRICS_FILE = os.path.join(settings.BASE_DIR, "performance_metrics.json")

def track_prediction(ticker: str, predicted: str, actual: str, confidence: float):
    """
    Log a prediction and its actual outcome to track accuracy over time.
    """
    ticker = ticker.upper()
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ticker": ticker,
        "predicted": predicted,
        "actual": actual,
        "is_correct": predicted == actual,
        "confidence": confidence
    }

    try:
        # Load existing metrics
        metrics = []
        if os.path.exists(METRICS_FILE):
            with open(METRICS_FILE, "r") as f:
                metrics = json.load(f)
        
        # Add new entry and keep only last 1000
        metrics.append(entry)
        if len(metrics) > 1000:
            metrics.pop(0)
            
        # Save back
        with open(METRICS_FILE, "w") as f:
            json.dump(metrics, f, indent=2)
            
        logger.info(f"METRIC TRACKED: {ticker} | Pred: {predicted} | Actual: {actual} | Correct: {predicted == actual}")
    except Exception as e:
        logger.error(f"Failed to track prediction metric: {e}")

def get_accuracy_report(ticker: str = None) -> Dict[str, Any]:
    """
    Return summary accuracy statistics from the tracked metrics.
    """
    if not os.path.exists(METRICS_FILE):
        return {"error": "No metrics recorded yet."}

    try:
        with open(METRICS_FILE, "r") as f:
            metrics = json.load(f)
            
        if ticker:
            ticker = ticker.upper()
            metrics = [m for m in metrics if m["ticker"] == ticker]
            
        if not metrics:
            return {"error": f"No metrics for {ticker}" if ticker else "No metrics."}
            
        total = len(metrics)
        correct = sum(1 for m in metrics if m["is_correct"])
        avg_confidence = sum(m["confidence"] for m in metrics) / total
        
        return {
            "total_samples": total,
            "accuracy": round(correct / total, 4),
            "avg_confidence": round(avg_confidence, 4),
            "last_updated": metrics[-1]["timestamp"]
        }
    except Exception as e:
        logger.error(f"Failed to generate accuracy report: {e}")
        return {"error": "Failed to load metrics."}
