import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch, MagicMock
import numpy as np
from core.schemas import PredictionResponse

client = TestClient(app)

@pytest.fixture
def mock_prediction_success():
    with patch("services.prediction_service.get_prediction") as mock:
        mock.return_value = PredictionResponse(
            ticker="AAPL",
            signal="BUY",
            confidence=0.85,
            price=150.0,
            timestamp="2026-04-03T16:00:00Z",
            latency_ms=10.5
        )
        yield mock

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "models_loaded" in data

def test_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_predictions" in data
    assert "average_latency_ms" in data

def test_predict_success(mock_prediction_success):
    response = client.get("/api/v1/predict/AAPL")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "AAPL"
    assert data["signal"] == "BUY"
    assert data["confidence"] == 0.85

def test_predict_invalid_ticker():
    # Test with empty/whitespace ticker
    response = client.get("/api/v1/predict/%20")
    # Our endpoint handles empty ticker with 400
    assert response.status_code == 400

@patch("services.prediction_service.get_clean_data")
@patch("services.model_manager.model_manager.load_model")
@patch("services.model_manager.model_manager.load_scaler")
def test_insufficient_data(mock_scaler, mock_model, mock_data):
    # Mock data with fewer rows than SEQUENCE_LENGTH (60)
    import pandas as pd
    mock_data.return_value = pd.DataFrame({
        "Close": [100] * 10,
        "Open": [100] * 10,
        "High": [100] * 10,
        "Low": [100] * 10,
        "Volume": [1000] * 10
    })
    
    # Prediction should fallback to HOLD due to validation error
    response = client.get("/api/v1/predict/AAPL")
    assert response.status_code == 200
    data = response.json()
    assert data["signal"] == "HOLD"
    assert data["confidence"] == 0.0

@patch("services.model_manager.model_manager.load_model")
def test_model_not_found_fallback(mock_load_model):
    # If model is not found, prediction_service catches FileNotFoundError 
    # and returns a fallback HOLD response
    mock_load_model.side_effect = FileNotFoundError("Model not found")
    
    response = client.get("/api/v1/predict/UNKNOWN")
    assert response.status_code == 200
    data = response.json()
    assert data["signal"] == "HOLD"
    assert data["confidence"] == 0.0

def test_train_endpoint():
    # Test triggering training (async)
    response = client.post("/api/v1/train", json={"ticker": "AAPL"})
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    assert "started in background" in response.json()["message"]
