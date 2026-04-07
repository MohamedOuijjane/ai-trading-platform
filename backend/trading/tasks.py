import logging
import requests
import json
from celery import shared_task
from django.conf import settings
from administration.models import Prediction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=2, default_retry_delay=5)
def get_ml_prediction_task(self, ticker):
    """
    Async task to fetch prediction from ML service.
    Includes retries, error handling, and WebSocket broadcast.
    """
    ticker = ticker.upper()
    ml_url = getattr(settings, "ML_SERVICE_URL", "http://ml-service:8000/api/v1/predict/")
    url = f"{ml_url}{ticker}"
    
    try:
        logger.info(f"Task started: Fetching prediction for {ticker}")
        response = requests.get(url, timeout=15)
        
        if response.status_code != 200:
            logger.warning(f"ML service returned {response.status_code}. Retrying...")
            raise self.retry(exc=RuntimeError(f"ML service error: {response.text}"))
            
        data = response.json()
        
        # Validate response
        required_keys = ["ticker", "signal", "confidence", "price"]
        if not all(k in data for k in required_keys):
            raise ValueError(f"Invalid ML response: {data}")
            
        # Save to DB
        prediction = Prediction.objects.create(
            symbol=data["ticker"],
            signal=data["signal"],
            confidence=data["confidence"],
            predicted_price=data["price"]
        )

        # BROADCAST to WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "market_updates",
            {
                "type": "market_update",
                "data": {
                    "type": "PREDICTION_UPDATE",
                    "ticker": data["ticker"],
                    "signal": data["signal"],
                    "confidence": data["confidence"],
                    "price": float(data["price"])
                }
            }
        )
        
        logger.info(f"Task success: Saved & Broadcasted prediction {prediction.id} for {ticker}")
        return {
            "id": prediction.id,
            "ticker": prediction.symbol,
            "signal": prediction.signal,
            "confidence": prediction.confidence,
            "price": float(prediction.predicted_price)
        }
        
    except requests.RequestException as e:
        logger.error(f"Network error in ML task: {e}")
        try:
            self.retry(exc=e)
        except Exception:
            # Fallback: Get last prediction from DB if retries exhausted
            logger.warning(f"Retries exhausted. Using fallback for {ticker}")
            last_pred = Prediction.objects.filter(symbol=ticker).order_by('-created_at').first()
            if last_pred:
                return {
                    "id": last_pred.id,
                    "ticker": last_pred.symbol,
                    "signal": last_pred.signal,
                    "confidence": last_pred.confidence,
                    "price": float(last_pred.predicted_price),
                    "is_fallback": True
                }
            raise
    except Exception as e:
        logger.error(f"Unexpected error in ML task: {e}")
        raise
