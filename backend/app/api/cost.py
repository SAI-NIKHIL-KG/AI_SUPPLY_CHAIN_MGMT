from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supply_chain import Inventory, Product, Shipment, Order

router = APIRouter(prefix="/cost", tags=["Cost Analytics"])


@router.get("/overview")
def cost_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Approximate from paper Table VIII (Rs. Lakh)
    procurement = 420.5
    transportation = (
        (db.query(func.sum(Shipment.cost)).scalar() or 0) / 100000
    ) or 95.2
    inv_value = (
        db.query(func.sum(Inventory.quantity_on_hand * Product.unit_cost))
        .join(Product)
        .scalar()
        or 0
    )
    holding = round(inv_value * 0.02 / 100000, 1) or 78.6  # ~2% monthly holding
    warehouse = 52.0
    ordering = 28.4
    total = procurement + transportation + holding + warehouse + ordering

    return {
        "currency": "INR (Rs. Lakh)",
        "components": [
            {"name": "Procurement", "amount_lakh": procurement, "share_pct": round(procurement / total * 100, 1)},
            {"name": "Transportation", "amount_lakh": round(transportation, 1), "share_pct": round(transportation / total * 100, 1)},
            {"name": "Inventory Holding", "amount_lakh": holding, "share_pct": round(holding / total * 100, 1)},
            {"name": "Warehouse", "amount_lakh": warehouse, "share_pct": round(warehouse / total * 100, 1)},
            {"name": "Ordering / Admin", "amount_lakh": ordering, "share_pct": round(ordering / total * 100, 1)},
        ],
        "total_lakh": round(total, 1),
        "recommendations": [
            "Consolidate suppliers for volume discounts (~₹12–18 Lakh annualized)",
            "Mode shift on non-critical lanes to reduce freight",
            "Reduce excess inventory in overstock categories",
        ],
    }


@router.get("/trends")
def cost_trends(current_user: User = Depends(get_current_user)):
    months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"]
    return {
        "monthly": [
            {"month": m, "procurement": 380 + i * 8, "transport": 88 + i * 1.5, "holding": 72 + i * 1.2}
            for i, m in enumerate(months)
        ]
    }
