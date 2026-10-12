"""Central API router – kept separate from __init__.py to avoid circular imports."""
from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.inventory import router as inventory_router
from app.api.suppliers import router as suppliers_router
from app.api.logistics import router as logistics_router
from app.api.risk import router as risk_router
from app.api.forecast import router as forecast_router
from app.api.cost import router as cost_router
from app.api.assistant import router as assistant_router
from app.api.simulation import router as simulation_router
from app.api.reports import router as reports_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(inventory_router)
api_router.include_router(suppliers_router)
api_router.include_router(logistics_router)
api_router.include_router(risk_router)
api_router.include_router(forecast_router)
api_router.include_router(cost_router)
api_router.include_router(assistant_router)
api_router.include_router(simulation_router)
api_router.include_router(reports_router)
