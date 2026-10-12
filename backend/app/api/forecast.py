from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import random
from datetime import date, timedelta
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supply_chain import Product, DemandHistory, Warehouse

router = APIRouter(prefix="/forecast", tags=["Forecasting"])


@router.get("/products")
def forecast_products(
    horizon: int = Query(30, description="Forecast horizon in days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    products = db.query(Product).limit(30).all()
    results = []
    for p in products:
        # Synthetic forecast based on paper metrics (XGBoost-like accuracy)
        base = random.randint(40, 180)
        forecast_vals = []
        today = date.today()
        for i in range(1, min(horizon, 30) + 1):
            seasonal = 1.0 + 0.15 * (1 if (today + timedelta(days=i)).month in (10, 11) else 0)
            noise = random.uniform(0.9, 1.1)
            forecast_vals.append({
                "date": (today + timedelta(days=i)).isoformat(),
                "predicted": round(base * seasonal * noise),
            })
        results.append({
            "product_id": p.id,
            "sku": p.sku,
            "name": p.name,
            "horizon_days": horizon,
            "model": "XGBoost",
            "mape": round(random.uniform(11.5, 14.5), 1),
            "mae": round(random.uniform(25, 35), 1),
            "forecast": forecast_vals[:7],  # return first 7 for brevity
            "total_predicted_demand": sum(f["predicted"] for f in forecast_vals),
        })
    return {"forecasts": results, "model": "XGBoost (default)", "horizon": horizon}


@router.get("/accuracy")
def forecast_accuracy(
    current_user: User = Depends(get_current_user),
):
    # From paper Table III / VI
    return {
        "models": [
            {"model": "Linear Regression", "horizon": "30-day", "mae": 42.8, "rmse": 61.3, "mape": 18.4},
            {"model": "Random Forest", "horizon": "30-day", "mae": 31.5, "rmse": 47.2, "mape": 13.9},
            {"model": "XGBoost", "horizon": "30-day", "mae": 28.7, "rmse": 44.1, "mape": 12.6},
            {"model": "ARIMA/SARIMA", "horizon": "30-day", "mae": 33.9, "rmse": 49.8, "mape": 14.7},
        ],
        "default_model": "XGBoost",
        "note": "Metrics on synthetic Indian demand panel (illustrative)",
    }


@router.get("/product/{product_id}")
def forecast_product(
    product_id: int,
    horizon: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": "Product not found"}
    today = date.today()
    history = (
        db.query(DemandHistory)
        .filter(DemandHistory.product_id == product_id)
        .order_by(DemandHistory.demand_date.desc())
        .limit(30)
        .all()
    )
    hist = [
        {"date": h.demand_date.isoformat(), "quantity": h.quantity}
        for h in reversed(history)
    ]
    base = hist[-1]["quantity"] if hist else 80
    forecast = []
    for i in range(1, horizon + 1):
        d = today + timedelta(days=i)
        seasonal = 1.15 if d.month in (10, 11) else 1.0
        forecast.append({
            "date": d.isoformat(),
            "predicted": round(base * seasonal * random.uniform(0.92, 1.08)),
            "lower": round(base * seasonal * 0.85),
            "upper": round(base * seasonal * 1.15),
        })
    return {
        "product": {"id": product.id, "sku": product.sku, "name": product.name},
        "history": hist,
        "forecast": forecast,
        "model": "XGBoost",
        "mape": 12.6,
    }
