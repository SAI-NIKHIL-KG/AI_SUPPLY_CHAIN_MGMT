# Architecture – AI Supply Chain Management

**BharatSmart Logistics Pvt. Ltd.** · Jyothy Institute of Technology, Bengaluru

## Overview

Intelligent decision-support system for demand forecasting, inventory optimization, supplier risk scoring, and logistics analytics focused on the Indian market (INR, GST-style supplier fields, major metro warehouse network).

```
┌─────────────────┐     /api/*      ┌──────────────────────┐
│  React + Vite   │ ──────────────► │  FastAPI (uvicorn)   │
│  Tailwind       │◄──────────────  │  JWT + role RBAC     │
│  Recharts       │                 │  SQLAlchemy ORM      │
└─────────────────┘                 └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │  SQLite (demo) /     │
                                    │  PostgreSQL (prod)   │
                                    └──────────────────────┘
                                               ▲
                                    ┌──────────┴───────────┐
                                    │  ml/train_forecast.py│
                                    │  sklearn / XGBoost   │
                                    └──────────────────────┘
```

## Backend modules

| Path | Responsibility |
|------|----------------|
| `app/api/auth.py` | Register, login (form + JSON), `/me`, logout |
| `app/api/dashboard.py` | KPI summary (inventory value, OTD, stockout counts) |
| `app/api/inventory.py` | List, alerts, reorder recommendations (ROP/EOQ) |
| `app/api/suppliers.py` | Multi-criteria scorecard + recommendations |
| `app/api/logistics.py` | Shipments, route analytics, delayed list |
| `app/api/forecast.py` | Horizon forecasts + model accuracy table |
| `app/api/risk.py` | Aggregated risk + mitigation text |
| `app/api/cost.py` | Cost breakdown & trends (Rs. Lakh) |
| `app/api/assistant.py` | Rule-based NL Q&A over live tables |
| `app/api/simulation.py` | What-if demand / delay / cost shocks |
| `app/api/reports.py` | CSV exports (inventory, suppliers, logistics, risk, cost, executive) |

## Roles

`admin` · `supply_chain_manager` · `inventory_manager` · `logistics_manager` · `viewer`

JWT subject = email; `get_current_user` enforces active users.

## Data model (core)

- **Category / Product** – SKU, HSN, unit cost (INR), lead time  
- **Supplier** – delivery, quality, cost, reliability, lead-time consistency → risk band  
- **Warehouse** – capacity, utilization, lat/lng (India metros)  
- **Inventory** – on-hand, safety stock, ROP, EOQ, stockout probability, status  
- **Order / Shipment** – status, delay flag, cost  
- **DemandHistory** – daily demand panel for forecasting  
- **RiskPrediction** – entity-level scores & recommendations  

## ML

`ml/train_forecast.py` trains Linear Regression, Random Forest, and XGBoost on a synthetic seasonal panel, writes:

- `ml/models/*.pkl`
- `ml/metrics.json`

API forecast endpoints currently serve calibrated synthetic series aligned to paper metrics (MAPE ~12.6% for XGBoost) for stable demos; swap in loaded pickles for production.

## Frontend routes

`/login` `/signup` `/` (dashboard) `/forecast` `/inventory` `/suppliers` `/logistics` `/map` `/risk` `/cost` `/assistant` `/simulation` `/reports`

Vite proxies `/api` → `http://127.0.0.1:8000`.
