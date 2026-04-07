import requests
import logging
from django.conf import settings
from django.core.cache import cache
from administration.models import Prediction

logger = logging.getLogger(__name__)


class PredictionService:
    ML_SERVICE_URL = getattr(
        settings,
        "ML_SERVICE_URL",
        "http://localhost:8000/api/v1/predict/"
    )
    CACHE_TIMEOUT = 300  # 5 minutes

    @staticmethod
    def get_prediction(ticker, user=None):
        logger.info("ENTER get_prediction")
        logger.info("PredictionService.get_prediction CALLED")
        logger.info(f"Using model: {Prediction}")
        logger.info(f"DB table: {Prediction._meta.db_table}")

        ticker = ticker.upper()
        cache_key = f"prediction_{ticker}"

        try:
            # 🔴 MANUAL TEST SAVE
            logger.info("Executing MANUAL TEST SAVE...")
            test = Prediction.objects.create(
                symbol="TEST",
                signal="BUY",
                confidence=0.99,
                predicted_price=123.45
            )
            logger.info(f"TEST SAVE ID: {test.id}")

            # 1. Try Cache First
            data = cache.get(cache_key)
            logger.info(f"Cache data: {data}")

            if not data:
                # 2. Fetch from API if cache miss
                logger.info("Calling ML API...")
                url = f"{PredictionService.ML_SERVICE_URL}{ticker}"
                response = requests.get(url, timeout=10)

                # 🔴 HARD FAIL if API fails
                if response.status_code != 200:
                    raise RuntimeError(
                        f"ML service error {response.status_code}: {response.text}"
                    )

                data = response.json()
                logger.info(f"API response data: {data}")

                # 🔴 VALIDATE RESPONSE
                required_keys = ["ticker", "signal", "confidence", "price"]
                missing = [k for k in required_keys if k not in data]

                if missing:
                    raise ValueError(f"Invalid ML response, missing: {missing}")

                # 🔴 CACHE RESULT
                cache.set(cache_key, data, PredictionService.CACHE_TIMEOUT)

            # 🔴 ALWAYS SAVE TO DB (even on cache hit)
            logger.info("REACHED DB SAVE BLOCK")
            logger.info("Saving prediction to DB...")
            try:
                prediction = Prediction.objects.create(
                    symbol=data["ticker"],
                    signal=data["signal"],
                    confidence=data["confidence"],
                    predicted_price=data["price"],
                )
                logger.info("DB SAVE SUCCESS")
                logger.info(f"Saved prediction ID: {prediction.id}")
            except Exception as e:
                logger.error(f"DB SAVE ERROR: {e}")
                raise

            logger.info("RETURNING RESPONSE")
            return {
                "ticker": prediction.symbol,
                "signal": prediction.signal,
                "confidence": prediction.confidence,
                "price": float(prediction.predicted_price),
                "timestamp": prediction.created_at,
            }

        except Exception as e:
            logger.error(f"GLOBAL ERROR: {e}")
            logger.error(f"Prediction failed for {ticker}: {e}")
            raise  # 🔴 NO SILENT FALLBACK
