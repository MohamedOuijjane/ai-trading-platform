"""
api.py – FastAPI REST service for the ML trading model.

Start with:
    uvicorn api:app --reload --port 8000

Endpoints:
    GET  /health            – service liveness check
    GET  /predict/{ticker}  – get BUY/SELL/HOLD signal
    POST /train             – (re)train model for a given ticker
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

app = FastAPI(
    title="AI Trading Bot – ML Service",
    description="LSTM-based market prediction API",
    version="1.0.0",
)

# Allow the Django backend (person 1) to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────────────

class PredictionResponse(BaseModel):
    ticker:     str
    signal:     str          # BUY | SELL | HOLD
    confidence: float
    price:      float
    timestamp:  str


class TrainRequest(BaseModel):
    ticker: str = "AAPL"
    epochs: Optional[int] = None   # None → use config default


class TrainResponse(BaseModel):
    ticker:       str
    epochs_run:   int
    val_accuracy: float
    val_loss:     float
    model_path:   str
    status:       str


class HealthResponse(BaseModel):
    status:      str
    model_ready: bool
    version:     str


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _model_exists() -> bool:
    from config import MODEL_PATH
    return os.path.exists(MODEL_PATH)


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health():
    """Lightweight liveness / readiness probe."""
    return HealthResponse(
        status="ok",
        model_ready=_model_exists(),
        version=app.version,
    )


@app.get("/predict/{ticker}", response_model=PredictionResponse, tags=["Prediction"])
def predict(ticker: str):
    """
    Return a BUY / SELL / HOLD signal for `ticker`.

    The model must have been trained at least once before calling this endpoint.
    """
    if not _model_exists():
        raise HTTPException(
            status_code=503,
            detail="Model not trained yet. POST /train first.",
        )
    try:
        from predict import get_prediction
        result = get_prediction(ticker.upper())
        return PredictionResponse(**result)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")


@app.post("/train", response_model=TrainResponse, tags=["Training"])
def train_model(body: TrainRequest, background_tasks: BackgroundTasks):
    """
    Trigger (re)training of the LSTM model.

    Training runs **synchronously** so the response confirms completion.
    For long runs, consider moving to a background task / Celery.
    """
    try:
        from train import train
        from config import EPOCHS
        result = train(
            ticker=body.ticker.upper(),
            epochs=body.epochs if body.epochs else EPOCHS,
        )
        return TrainResponse(status="completed", **result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Dev entry-point
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
