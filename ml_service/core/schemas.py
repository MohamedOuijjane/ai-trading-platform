from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class PredictionRequest(BaseModel):
    ticker: str = Field(..., description="The stock ticker symbol (e.g., AAPL)")
    
    @validator('ticker')
    def validate_ticker(cls, v):
        if not v or not v.strip():
            raise ValueError("Ticker cannot be empty")
        return v.upper().strip()

class PredictionResponse(BaseModel):
    ticker: str
    signal: str          # BUY | SELL | HOLD
    confidence: float    # 0.0 to 1.0 (Softmax output)
    price: float
    timestamp: str
    latency_ms: float

class TrainRequest(BaseModel):
    ticker: str = Field("AAPL", description="Ticker to train on")
    epochs: Optional[int] = Field(None, description="Number of epochs to train")
    
    @validator('ticker')
    def validate_ticker(cls, v):
        return v.upper().strip()

class TrainResponse(BaseModel):
    ticker: str
    epochs_run: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    val_loss: float
    model_path: str
    status: str
    message: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    model_ready: bool
    models_loaded: List[str]
    version: str
    uptime: float

class MetricsResponse(BaseModel):
    total_predictions: int
    total_training_runs: int
    cache_hits: int
    average_latency_ms: float

class ErrorResponse(BaseModel):
    error: str
    detail: str
    status_code: int
