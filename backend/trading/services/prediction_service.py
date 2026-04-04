import requests
import logging
from django.conf import settings
from administration.models import Prediction

logger = logging.getLogger(__name__)

class PredictionService:
    ML_SERVICE_URL = "http://ml-service:8000/api/v1/predict/"

    @staticmethod
    def get_prediction(ticker, user=None):
        """
        Proxy call to ML Service and save prediction in DB.
        """
        ticker = ticker.upper()
        try:
            response = requests.get(f"{PredictionService.ML_SERVICE_URL}{ticker}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Save prediction in DB for auditing
                prediction = Prediction.objects.create(
                    ticker=data['ticker'],
                    signal=data['signal'],
                    confidence=data['confidence'],
                    price=data['price']
                )
                
                return {
                    "ticker": prediction.ticker,
                    "signal": prediction.signal,
                    "confidence": prediction.confidence,
                    "price": prediction.price,
                    "timestamp": prediction.timestamp
                }
            else:
                logger.error(f"ML Service returned {response.status_code} for {ticker}")
                return PredictionService.get_fallback(ticker)

        except (requests.RequestException, KeyError) as e:
            logger.error(f"ML Service communication error: {e}")
            return PredictionService.get_fallback(ticker)

    @staticmethod
    def get_fallback(ticker):
        """Safe fallback if ML service is unreachable."""
        return {
            "ticker": ticker,
            "signal": "HOLD",
            "confidence": 0.0,
            "price": 0.0,
            "error": "ML service unreachable"
        }
