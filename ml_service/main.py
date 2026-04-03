from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from core.config import settings
from core.logging_config import logger
from api.v1.endpoints import router as api_router
from services.model_manager import model_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load models and scalers once
    logger.info("Starting ML Service...")
    start_time = time.time()
    try:
        model_manager.preload_models()
        logger.info(f"Models preloaded in {time.time() - start_time:.2f}s")
    except Exception as e:
        logger.error(f"Failed to preload models: {e}", exc_info=True)
    
    yield
    
    # Shutdown: Clean up resources
    logger.info("Shutting down ML Service...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="LSTM-based market prediction API - Production Refactored",
    version="1.1.0",
    lifespan=lifespan
)

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for Logging & Latency Tracking
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log requests with structured JSON
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"Status: {response.status_code} "
        f"Time: {process_time:.4f}s"
    )
    return response

# Custom Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if settings.DEBUG else "Please check service logs.",
            "status_code": 500
        }
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": str(exc),
            "status_code": 422
        }
    )

# Include API Router with Versioning
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health endpoint at root for easier integration
@app.get("/health", tags=["System"])
async def root_health():
    return {"status": "ok", "service": settings.PROJECT_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
