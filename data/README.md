# Data

Demo data is **generated at API startup** by `backend/app/db/seed.py` into SQLite (`DATABASE_URL`, default `/tmp/ai_scm.db`).

Seeded volumes (deterministic `random.seed(42)`):

| Entity | Approx. count |
|--------|----------------|
| Users (demo roles) | 5 |
| Categories | 10 |
| Products | 120 |
| Suppliers | 30 |
| Warehouses (India metros) | 13 |
| Inventory rows | ~430 |
| Orders | 500 |
| Shipments | 300 |
| Demand history | ~19,200 |
| Risk predictions | high-risk suppliers + critical stock |

No external CSV is required for the demo. To export live tables, use **Reports → CSV** in the UI or `GET /api/reports/*`.

For offline ML experiments, run:

```bash
cd backend && export PYTHONPATH=$(pwd)
python ../ml/train_forecast.py
```

Artifacts land in `ml/models/` and `ml/metrics.json`.
