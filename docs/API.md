# API Reference (prefix `/api`)

All endpoints except `/auth/register`, `/auth/login`, `/auth/login/json` require:

```
Authorization: Bearer <access_token>
```

## Auth

| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/auth/register` | `{email, full_name, password, role?}` | Public signup |
| POST | `/auth/login` | form: username, password | OAuth2 form |
| POST | `/auth/login/json` | `{email, password}` | Used by React |
| GET | `/auth/me` | — | Current user |
| POST | `/auth/logout` | — | Client discards token |

## Domain

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/summary` | INR KPIs |
| GET | `/dashboard/kpis` | Labelled KPI list |
| GET | `/inventory` | Paginated inventory |
| GET | `/inventory/alerts` | Critical / low stock |
| GET | `/inventory/recommendations` | ROP / EOQ actions |
| GET | `/suppliers` | Scorecards |
| GET | `/suppliers/recommendation` | Best supplier |
| GET | `/shipments` | Shipment list |
| GET | `/shipments/routes` | Route aggregates |
| GET | `/shipments/delayed` | Delay flags |
| GET | `/forecast/products?horizon=` | Multi-SKU forecast |
| GET | `/forecast/accuracy` | Model comparison table |
| GET | `/forecast/product/{id}` | History + forecast |
| GET | `/risk/overview` | Aggregated risk |
| GET | `/risk/predictions` | Entity risks |
| GET | `/cost/overview` | Cost buckets |
| GET | `/cost/trends` | Trend series |
| POST | `/ai/assistant` | `{query}` NL answer |
| POST | `/simulation/run` | What-if payload |
| GET | `/reports/inventory` | CSV download |
| GET | `/reports/suppliers` | CSV download |
| GET | `/reports/logistics` | CSV download |
| GET | `/reports/risk` | CSV download |
| GET | `/reports/cost` | CSV download |
| GET | `/reports/executive` | CSV download |

Interactive docs: `http://localhost:8000/docs`
