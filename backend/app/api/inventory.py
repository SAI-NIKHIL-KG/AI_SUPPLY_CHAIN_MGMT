from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supply_chain import Inventory, Product, Warehouse

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("")
def list_inventory(
    warehouse_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = (
        db.query(Inventory)
        .options(joinedload(Inventory.product), joinedload(Inventory.warehouse))
    )
    if warehouse_id:
        q = q.filter(Inventory.warehouse_id == warehouse_id)
    if status:
        q = q.filter(Inventory.status == status)
    items = q.limit(200).all()
    result = []
    for inv in items:
        result.append({
            "id": inv.id,
            "product_id": inv.product_id,
            "sku": inv.product.sku if inv.product else None,
            "product_name": inv.product.name if inv.product else None,
            "warehouse_id": inv.warehouse_id,
            "warehouse_name": inv.warehouse.name if inv.warehouse else None,
            "warehouse_city": inv.warehouse.city if inv.warehouse else None,
            "quantity_on_hand": inv.quantity_on_hand,
            "safety_stock": inv.safety_stock,
            "reorder_point": inv.reorder_point,
            "eoq": inv.eoq,
            "stockout_probability": inv.stockout_probability,
            "status": inv.status,
            "unit_cost": inv.product.unit_cost if inv.product else 0,
            "inventory_value": (inv.quantity_on_hand * (inv.product.unit_cost if inv.product else 0)),
        })
    return {"items": result, "count": len(result)}


@router.get("/alerts")
def inventory_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    critical = (
        db.query(Inventory)
        .options(joinedload(Inventory.product), joinedload(Inventory.warehouse))
        .filter(Inventory.status.in_(["Critical", "Low Stock"]))
        .all()
    )
    alerts = []
    for inv in critical:
        alerts.append({
            "id": inv.id,
            "sku": inv.product.sku if inv.product else "N/A",
            "product_name": inv.product.name if inv.product else "N/A",
            "warehouse": inv.warehouse.city if inv.warehouse else "N/A",
            "status": inv.status,
            "quantity": inv.quantity_on_hand,
            "reorder_point": inv.reorder_point,
            "stockout_probability": inv.stockout_probability,
            "priority": "Critical" if inv.status == "Critical" else "High",
        })
    return {"alerts": alerts, "count": len(alerts)}


@router.get("/recommendations")
def reorder_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    low = (
        db.query(Inventory)
        .options(joinedload(Inventory.product), joinedload(Inventory.warehouse))
        .filter(Inventory.status.in_(["Critical", "Low Stock"]))
        .limit(20)
        .all()
    )
    recs = []
    for inv in low:
        suggested_qty = max(inv.eoq, inv.reorder_point - inv.quantity_on_hand + inv.safety_stock)
        recs.append({
            "sku": inv.product.sku if inv.product else "N/A",
            "product_name": inv.product.name if inv.product else "N/A",
            "warehouse": inv.warehouse.city if inv.warehouse else "N/A",
            "current_qty": inv.quantity_on_hand,
            "suggested_order_qty": suggested_qty,
            "estimated_cost_inr": round(suggested_qty * (inv.product.unit_cost if inv.product else 0), 2),
            "reason": f"Status: {inv.status}, Stockout prob: {inv.stockout_probability:.0%}",
        })
    return {"recommendations": recs}
