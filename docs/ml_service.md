# ML Service Documentation

This document describes how to run, test, and integrate the Machine Learning (ML) service of the AI Trading Platform.

## 📁 Project Structure

The ML service is located in the `ml_service/` directory.

- `main.py`: Entry point for the FastAPI application.
- `core/config.py`: Service configuration (Tickers, Port, Sequence Length, etc.).
- `api/v1/endpoints.py`: API routes for prediction and training.
- `services/`: Core logic for data collection, indicators, and model management.
- `model/`: Directory where trained `.keras` models and scalers are stored.

## 🚀 Running the Service

### 1. Navigate to the ML Service Directory
```bash
cd ml_service
```

### 2. Start the API Server
Using the local virtual environment:
```powershell
venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload
```

## 🧪 Testing the API

The API is accessible at `http://localhost:8000`.

### Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Quick health check |
| **GET** | `/api/v1/predict/{ticker}` | Get BUY/SELL/HOLD signal (e.g., `AAPL`) |
| **POST** | `/api/v1/train` | Trigger model training for a ticker |
| **GET** | `/api/v1/metrics` | Performance and latency metrics |

### Example Prediction Request
```bash
curl http://localhost:8000/api/v1/predict/AAPL
```

## 🛠️ Model Training

To train the models for all configured tickers (AAPL, TSLA, NVDA, MSFT, GOOGL, AMZN, BTC-USD, ETH-USD), run:
```powershell
venv\Scripts\python.exe -c "from services.training_service import train; from core.config import settings; [train(t, epochs=2) for t in settings.TICKERS]"
```
*(Note: Use more epochs for production-ready models).*

## 📖 Interactive API Docs
Full Swagger documentation is available at:  
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**
