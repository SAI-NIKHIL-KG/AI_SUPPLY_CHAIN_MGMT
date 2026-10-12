# AI Supply Chain Management

**Intelligent Decision Support System for Demand Forecasting, Inventory Optimization, and Risk Prediction in the Indian Market**

BharatSmart Logistics Pvt. Ltd. · Jyothy Institute of Technology, Bengaluru

## Features

- **Authentication**: Sign up & Login with JWT + role-based access (Admin, Supply Chain Manager, Inventory Manager, Logistics Manager, Viewer)
- **Executive Dashboard**: KPIs in INR, stockout alerts, risk summary
- **Demand Forecasting**: Linear Regression, Random Forest, XGBoost, ARIMA — 7/30/90-day horizons
- **Smart Inventory**: Safety stock, ROP, EOQ, stockout probability, status labels
- **Supplier Intelligence**: Multi-criteria scoring (delivery 30%, quality 25%, cost 20%, reliability 15%, lead time 10%) + risk bands LOW–CRITICAL
- **Logistics**: Shipment tracking, delay flags, route analytics
- **India Network Map**: Warehouses & routes across major Indian cities
- **Risk Center**: Aggregated risk score + AI mitigation recommendations
- **Cost Analytics**: Procurement, transport, holding, warehouse, ordering (Rs. Lakh)
- **AI Assistant**: Natural-language Q&A grounded in live data
- **What-If Simulation**: Demand shocks, supplier delay, transport cost scenarios

## Tech Stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Frontend | React, Vite, Tailwind CSS, Recharts, Lucide       |
| Backend  | Python, FastAPI, SQLAlchemy, JWT, Pydantic        |
| Database | SQLite (demo) / PostgreSQL (production)           |
| ML       | Scikit-learn, XGBoost-ready pipeline              |

## Quick Start

### One-command (recommended)

```bash
bash scripts/start.sh
```

Starts backend on **:8000** and frontend on **:5173** (installs deps if missing).

### Backend only

```bash
cd backend
pip install -r requirements.txt   # pin bcrypt==4.0.1 if needed
export PYTHONPATH=$(pwd)
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### Frontend only

```bash
cd frontend
npm install --registry https://registry.npmjs.org/
npm run dev
```

Open http://localhost:5173

### Demo Accounts

| Email                         | Password      | Role                  |
|-------------------------------|---------------|-----------------------|
| manager@bharatsmart.in        | manager123    | Supply Chain Manager  |
| admin@bharatsmart.in          | admin123      | Admin                 |
| inventory@bharatsmart.in      | inventory123  | Inventory Manager     |
| logistics@bharatsmart.in      | logistics123  | Logistics Manager     |
| viewer@bharatsmart.in         | viewer123     | Viewer                |

Or **Sign up** a new account from the UI.

## Project Structure

```
ai-scm/
├── backend/
│   ├── app/
│   │   ├── api/          # REST endpoints (auth … reports)
│   │   ├── core/         # Config, security
│   │   ├── db/           # Session, seed
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/        # Login, Signup, Dashboard, Reports, …
│   │   └── services/
│   └── package.json
├── ml/
│   ├── train_forecast.py # LR / RF / XGBoost training
│   ├── models/           # Saved .pkl models
│   └── metrics.json
├── data/                 # Seed notes (live DB via seed.py)
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
├── scripts/start.sh
└── README.md
```

## ML training (optional)

```bash
cd backend
export PYTHONPATH=$(pwd)
python3 ../ml/train_forecast.py
```

Writes `ml/models/*.pkl` and `ml/metrics.json` (Random Forest / XGBoost MAPE ~13% on synthetic panel).

## Reports

Authenticated CSV downloads:

- `GET /api/reports/inventory|suppliers|logistics|risk|cost|executive`

Or use **Reports** in the UI.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API reference](docs/API.md)

## Authors

- Sai Nikhil K G (1JT23AI043)
- Suprith Amarannavar S (1JT24AI402)
- Venkatesh Prasad B S (1JT23AI060)

Department of Artificial Intelligence and Machine Learning  
Jyothy Institute of Technology, Bengaluru
