import requests
import logging
import time
from django.conf import settings
from administration.models import Prediction

logger = logging.getLogger(__name__)

class PredictionService:
    @staticmethod
    def get_prediction(ticker, user=None):
        """
        Proxy call to ML Service and save prediction in DB.
        Includes logging, adapter layer and fallback management.
        """
        ticker = ticker.upper()
        url = f"{settings.ML_SERVICE_URL}/api/v1/predict/{ticker}"
        start_time = time.time()
        
        try:
            logger.info(f"ML_CALL: Requesting prediction for {ticker} at {url}")
            response = requests.get(url, timeout=5)
            latency = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                raw_data = response.json()
                logger.info(f"ML_SUCCESS: {ticker} - Latency: {latency:.2f}ms - Payload: {raw_data}")
                
                # Adapter Layer: Normalize response
                data = PredictionService.normalize_ml_response(raw_data)
                
                # Save prediction in DB for auditing
                prediction = Prediction.objects.create(
                    symbol=data['ticker'],
                    signal=data['signal'],
                    confidence=data['confidence'],
                    predicted_price=data['price']
                )
                
                return {
                    "ticker": prediction.symbol,
                    "signal": prediction.signal,
                    "confidence": prediction.confidence,
                    "price": float(prediction.predicted_price),
                    "timestamp": prediction.created_at,
                    "valid": True,
                    "latency_ms": latency
                }
            else:
                logger.error(f"ML_ERROR: Status {response.status_code} for {ticker} - {response.text}")
                return PredictionService.get_fallback(ticker, f"Status {response.status_code}")

        except requests.RequestException as e:
            logger.error(f"ML_NETWORK_ERROR: {ticker} - {str(e)}")
            return PredictionService.get_fallback(ticker, "Service unreachable")
        except (KeyError, ValueError) as e:
            logger.error(f"ML_DATA_ERROR: {ticker} - Response parsing failed: {str(e)}")
            return PredictionService.get_fallback(ticker, "Invalid response format")

    @staticmethod
    def normalize_ml_response(data):
        """Adapter layer: Ensure backend gets expected fields regardless of ML service version."""
        return {
            "ticker": data.get("ticker", "UNKNOWN"),
            "signal": data.get("signal", "HOLD"),
            "confidence": float(data.get("confidence", 0.0)),
            "price": float(data.get("price", 0.0))
        }

    @staticmethod
    def get_fallback(ticker, error_msg):
        """Safe fallback with valid flag set to False."""
        return {
            "ticker": ticker,
            "signal": "HOLD",
            "confidence": 0.0,
            "price": 0.0,
            "error": error_msg,
            "valid": False
        }
