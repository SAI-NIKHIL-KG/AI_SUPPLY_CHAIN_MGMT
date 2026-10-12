from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supply_chain import Inventory, Product

router = APIRouter(prefix="/simulation", tags=["Simulation"])


class SimulationRequest(BaseModel):
    scenario_type: str = Field(..., description="demand_increase | demand_decrease | supplier_delay | transport_cost | inventory_shortage")
    percentage: float = Field(20.0, description="Percentage change (e.g. 20 for +20%)")
    horizon_days: int = 30


@router.post("/run")
def run_simulation(
    body: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inv_value = (
        db.query(func.sum(Inventory.quantity_on_hand * Product.unit_cost))
        .join(Product)
        .scalar()
        or 5_000_000
    )
    critical_count = db.query(Inventory).filter(Inventory.status == "Critical").count()
    low_count = db.query(Inventory).filter(Inventory.status == "Low Stock").count()

    pct = body.percentage / 100.0
    stype = body.scenario_type.lower()

    if stype in ("demand_increase", "demand"):
        factor = 1 + pct
        additional_inv = inv_value * pct * 0.85
        additional_procurement = additional_inv * 1.05
        stockout_delta = min(0.25, pct * 0.6)
        transport_uplift = additional_inv * 0.12
        return {
            "scenario": f"Demand increases by {body.percentage}%",
            "horizon_days": body.horizon_days,
            "baseline": {
                "inventory_value_inr": round(inv_value, 0),
                "critical_skus": critical_count,
                "low_stock_skus": low_count,
                "stockout_risk_index": 0.12,
            },
            "scenario_result": {
                "required_inventory_uplift_inr": round(additional_inv, 0),
                "additional_procurement_cost_inr": round(additional_procurement, 0),
                "projected_stockout_probability": round(0.12 + stockout_delta, 3),
                "transportation_uplift_inr": round(transport_uplift, 0),
                "recommended_actions": [
                    "Increase safety stock for A-class SKUs",
                    "Place emergency POs for critical items",
                    "Review dual-sourcing options",
                ],
            },
            "comparison": {
                "inventory_change_pct": round(pct * 100, 1),
                "cost_impact_inr": round(additional_procurement + transport_uplift, 0),
                "risk_change": "Elevated" if stockout_delta > 0.05 else "Moderate",
            },
        }

    if stype == "demand_decrease":
        factor = 1 - pct
        return {
            "scenario": f"Demand decreases by {body.percentage}%",
            "baseline": {"inventory_value_inr": round(inv_value, 0)},
            "scenario_result": {
                "excess_inventory_risk_inr": round(inv_value * pct * 0.4, 0),
                "holding_cost_savings_inr": round(inv_value * pct * 0.02, 0),
                "recommended_actions": ["Promotions for overstock categories", "Inter-warehouse transfers"],
            },
        }

    if stype == "supplier_delay":
        return {
            "scenario": f"Supplier lead time increases by {body.percentage}%",
            "scenario_result": {
                "affected_skus_estimate": max(5, critical_count + low_count),
                "recommended_buffer_days": round(body.percentage / 10, 0),
                "recommended_actions": ["Expedite open POs", "Activate alternate suppliers", "Raise temporary safety stock"],
            },
        }

    if stype == "transport_cost":
        return {
            "scenario": f"Transportation cost changes by {body.percentage}%",
            "scenario_result": {
                "monthly_transport_impact_lakh": round(95.2 * pct, 2),
                "recommended_actions": ["Lane consolidation", "Mode optimization", "Carrier renegotiation"],
            },
        }

    return {
        "scenario": body.scenario_type,
        "message": "Scenario computed with illustrative impacts based on current inventory position.",
        "percentage": body.percentage,
    }
