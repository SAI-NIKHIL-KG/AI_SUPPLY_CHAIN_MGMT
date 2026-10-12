"""
Demand forecasting pipeline for AI Supply Chain Management.

Trains Linear Regression, Random Forest, and (if available) XGBoost
on synthetic / historical demand panels and saves models + metrics.

Usage:
  cd backend && export PYTHONPATH=$(pwd)
  python ../ml/train_forecast.py
"""
from __future__ import annotations

import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split

try:
    from xgboost import XGBRegressor

    HAS_XGB = True
except ImportError:
    HAS_XGB = False

ROOT = Path(__file__).resolve().parent
MODELS_DIR = ROOT / "models"
METRICS_PATH = ROOT / "metrics.json"
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def mape(y_true, y_pred) -> float:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mask = y_true != 0
    if not mask.any():
        return 0.0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def synthesize_panel(n_products: int = 40, n_days: int = 90, seed: int = 42) -> pd.DataFrame:
    """Generate a multi-SKU daily demand panel with seasonality (festival months)."""
    rng = np.random.default_rng(seed)
    rows = []
    base_date = pd.Timestamp("2024-07-01")
    for pid in range(1, n_products + 1):
        base = rng.integers(30, 160)
        for d in range(n_days):
            dt = base_date + pd.Timedelta(days=d)
            seasonal = 1.2 if dt.month in (10, 11) else (1.08 if dt.dayofweek >= 5 else 1.0)
            trend = 1.0 + 0.001 * d
            qty = max(0, int(base * seasonal * trend * rng.uniform(0.75, 1.25)))
            rows.append(
                {
                    "product_id": pid,
                    "day_of_week": dt.dayofweek,
                    "month": dt.month,
                    "day_index": d,
                    "is_festival": int(dt.month in (10, 11)),
                    "is_weekend": int(dt.dayofweek >= 5),
                    "quantity": qty,
                }
            )
    return pd.DataFrame(rows)


def feature_matrix(df: pd.DataFrame):
    feature_cols = ["day_of_week", "month", "day_index", "is_festival", "is_weekend", "product_id"]
    X = df[feature_cols].values
    y = df["quantity"].values
    return X, y, feature_cols


def evaluate(name: str, model, X_test, y_test) -> dict:
    pred = model.predict(X_test)
    return {
        "model": name,
        "horizon": "30-day panel",
        "mae": round(float(mean_absolute_error(y_test, pred)), 2),
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, pred))), 2),
        "mape": round(mape(y_test, pred), 2),
    }


def train():
    df = synthesize_panel()
    X, y, feature_cols = feature_matrix(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    metrics = []
    models = {}

    lr = LinearRegression()
    lr.fit(X_train, y_train)
    models["linear_regression"] = lr
    metrics.append(evaluate("Linear Regression", lr, X_test, y_test))

    rf = RandomForestRegressor(n_estimators=80, max_depth=12, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    models["random_forest"] = rf
    metrics.append(evaluate("Random Forest", rf, X_test, y_test))

    if HAS_XGB:
        xgb = XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.08,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )
        xgb.fit(X_train, y_train)
        models["xgboost"] = xgb
        metrics.append(evaluate("XGBoost", xgb, X_test, y_test))
    else:
        metrics.append(
            {
                "model": "XGBoost",
                "horizon": "30-day panel",
                "mae": None,
                "rmse": None,
                "mape": None,
                "note": "xgboost not installed",
            }
        )

    for name, model in models.items():
        path = MODELS_DIR / f"{name}.pkl"
        with open(path, "wb") as f:
            pickle.dump({"model": model, "features": feature_cols}, f)
        print(f"Saved {path}")

    payload = {
        "metrics": metrics,
        "default_model": "xgboost" if HAS_XGB else "random_forest",
        "feature_cols": feature_cols,
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
    }
    METRICS_PATH.write_text(json.dumps(payload, indent=2))
    print(json.dumps(payload, indent=2))
    return payload


if __name__ == "__main__":
    train()
