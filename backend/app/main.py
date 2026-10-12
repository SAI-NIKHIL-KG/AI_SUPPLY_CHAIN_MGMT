from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router
from app.db.session import engine, Base
from app.db.seed import seed

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI Supply Chain Management – Intelligent Decision Support System for Demand Forecasting, Inventory Optimization, and Risk Prediction in the Indian Market",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
    try:
        seed()
    except Exception as e:
        print(f"Seed warning: {e}")


@app.get("/")
def root():
    return {
        "message": "AI Supply Chain Management API",
        "company": "BharatSmart Logistics Pvt. Ltd.",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
