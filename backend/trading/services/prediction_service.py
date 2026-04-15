import requests
import logging
import time
import threading
from django.conf import settings
from administration.models import Prediction

logger = logging.getLogger(__name__)

_prediction_cache = {}
_cache_lock = threading.Lock()
_CACHE_TTL_SECONDS = 30


def _get_cached(ticker):
    with _cache_lock:
        entry = _prediction_cache.get(ticker)
        if entry is None:
            return None
        if time.time() - entry["timestamp"] > _CACHE_TTL_SECONDS:
            del _prediction_cache[ticker]
            return None
        return entry["data"]


def _set_cached(ticker, data):
    with _cache_lock:
        _prediction_cache[ticker] = {
            "data": data,
            "timestamp": time.time(),
        }


def clear_prediction_cache():
    with _cache_lock:
        _prediction_cache.clear()


class PredictionService:
    @staticmethod
    def get_prediction(ticker, user=None):
        ticker = ticker.upper()

        cached = _get_cached(ticker)
        if cached is not None:
            logger.info(f"CACHE_HIT: {ticker}")
            return cached

        logger.info(f"CACHE_MISS: {ticker} — calling ML service")

        url = f"{settings.ML_SERVICE_URL}/api/v1/predict/{ticker}"
        start_time = time.time()

        try:
            logger.info(f"ML_CALL: Requesting prediction for {ticker} at {url}")
            response = requests.get(url, timeout=5)
            latency = (time.time() - start_time) * 1000

            if response.status_code == 200:
                raw_data = response.json()
                logger.info(
                    f"ML_SUCCESS: {ticker} - Latency: {latency:.2f}ms - Payload: {raw_data}"
                )

                data = PredictionService.normalize_ml_response(raw_data)

                prediction = Prediction.objects.create(
                    symbol=data["ticker"],
                    signal=data["signal"],
                    confidence=data["confidence"],
                    predicted_price=data["price"],
                )

                result = {
                    "ticker": prediction.symbol,
                    "signal": prediction.signal,
                    "confidence": prediction.confidence,
                    "price": float(prediction.predicted_price),
                    "timestamp": prediction.created_at,
                    "valid": True,
                    "latency_ms": latency,
                }
                _set_cached(ticker, result)
                return result
            else:
                logger.error(
                    f"ML_ERROR: Status {response.status_code} for {ticker} - {response.text}"
                )
                fallback = PredictionService.get_fallback(
                    ticker, f"Status {response.status_code}"
                )
                _set_cached(ticker, fallback)
                return fallback

        except requests.RequestException as e:
            logger.error(f"ML_NETWORK_ERROR: {ticker} - {str(e)}")
            fallback = PredictionService.get_fallback(ticker, "Service unreachable")
            _set_cached(ticker, fallback)
            return fallback
        except (KeyError, ValueError) as e:
            logger.error(
                f"ML_DATA_ERROR: {ticker} - Response parsing failed: {str(e)}"
            )
            fallback = PredictionService.get_fallback(ticker, "Invalid response format")
            _set_cached(ticker, fallback)
            return fallback

    @staticmethod
    def get_prediction_batch(tickers):
        """
        Fetch predictions for multiple tickers IN PARALLEL using ThreadPoolExecutor.
        Returns a dict: { ticker: result }
        Results are NOT cached separately here — get_prediction() handles caching,
        so concurrent calls for the same ticker will all hit the cache after the first.
        """
        from concurrent.futures import ThreadPoolExecutor, as_completed

        results = {}
        tickers = [t.upper() for t in tickers]
        unique_tickers = list(set(tickers))

        with ThreadPoolExecutor(max_workers=min(len(unique_tickers), 8)) as executor:
            futures = {
                executor.submit(PredictionService.get_prediction, t): t
                for t in unique_tickers
            }

            for future in as_completed(futures):
                ticker = futures[future]
                try:
                    results[ticker] = future.result()
                except Exception as exc:
                    logger.error(f"Batch prediction error for {ticker}: {exc}")
                    results[ticker] = PredictionService.get_fallback(
                        ticker, "Batch error"
                    )

        return results

    @staticmethod
    def normalize_ml_response(data):
        return {
            "ticker": data.get("ticker", "UNKNOWN"),
            "signal": data.get("signal", "HOLD"),
            "confidence": float(data.get("confidence", 0.0)),
            "price": float(data.get("price", 0.0)),
        }

    @staticmethod
    def get_fallback(ticker, error_msg):
        return {
            "ticker": ticker,
            "signal": "HOLD",
            "confidence": 0.0,
            "price": 0.0,
            "error": error_msg,
            "valid": False,
        }
