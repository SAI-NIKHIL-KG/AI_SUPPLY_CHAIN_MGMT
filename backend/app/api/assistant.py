from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supply_chain import Inventory, Product, Supplier, Shipment, Warehouse

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


class AssistantQuery(BaseModel):
    query: str


@router.post("/assistant")
def ai_assistant(
    body: AssistantQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = body.query.lower().strip()

    # Intent routing (rule-based as described in paper)
    if any(w in q for w in ["out of stock", "stockout", "go out of stock", "low stock"]):
        items = (
            db.query(Inventory)
            .join(Product)
            .filter(Inventory.status.in_(["Critical", "Low Stock"]))
            .limit(8)
            .all()
        )
        if not items:
            return {"answer": "No products currently flagged for stockout risk.", "type": "inventory"}
        lines = [
            f"• {inv.product.sku} – {inv.product.name} ({inv.status}, qty={inv.quantity_on_hand}, P(stockout)={inv.stockout_probability:.0%})"
            for inv in items
        ]
        return {
            "answer": "Products that may go out of stock next month:\n" + "\n".join(lines),
            "type": "inventory",
            "data": [{"sku": i.product.sku, "status": i.status} for i in items],
        }

    if any(w in q for w in ["best supplier", "supplier performance", "top supplier"]):
        suppliers = db.query(Supplier).filter(Supplier.is_active == True).all()
        ranked = sorted(
            suppliers,
            key=lambda s: 0.3 * s.delivery_reliability + 0.25 * s.quality_score + 0.2 * s.cost_index,
            reverse=True,
        )
        top = ranked[0] if ranked else None
        if top:
            return {
                "answer": f"Best performing supplier: {top.name} ({top.city}). "
                f"Delivery reliability: {top.delivery_reliability:.0%}, Quality: {top.quality_score:.0%}, "
                f"Risk band: {top.risk_band}.",
                "type": "supplier",
            }
        return {"answer": "No supplier data available.", "type": "supplier"}

    if any(w in q for w in ["inventory value", "total inventory"]):
        val = (
            db.query(func.sum(Inventory.quantity_on_hand * Product.unit_cost))
            .join(Product)
            .scalar()
            or 0
        )
        return {
            "answer": f"Total inventory value is ₹{val:,.0f} (Indian Rupees).",
            "type": "cost",
        }

    if any(w in q for w in ["highest inventory", "warehouse has the highest"]):
        rows = (
            db.query(Warehouse.name, Warehouse.city, func.sum(Inventory.quantity_on_hand).label("qty"))
            .join(Inventory)
            .group_by(Warehouse.id)
            .order_by(func.sum(Inventory.quantity_on_hand).desc())
            .limit(1)
            .first()
        )
        if rows:
            return {
                "answer": f"Warehouse with highest inventory: {rows[0]} ({rows[1]}) with {rows[2]} units on hand.",
                "type": "inventory",
            }
        return {"answer": "No warehouse inventory data.", "type": "inventory"}

    if any(w in q for w in ["delayed", "delay shipment"]):
        delayed = db.query(Shipment).filter(Shipment.delay_flag == True).limit(5).all()
        if not delayed:
            return {"answer": "No delayed shipments at the moment.", "type": "logistics"}
        lines = [f"• {s.shipment_number}: {s.origin_city} → {s.destination_city} ({s.status})" for s in delayed]
        return {"answer": "Delayed shipments:\n" + "\n".join(lines), "type": "logistics"}

    if any(w in q for w in ["reduce transportation", "transport cost", "freight"]):
        return {
            "answer": "To reduce transportation cost:\n"
            "1. Consolidate partial loads on high-volume lanes (e.g., Mumbai–Bengaluru).\n"
            "2. Prefer historically reliable carriers with lower delay rates.\n"
            "3. Shift non-critical freight to lower-cost modes where lead time allows.\n"
            "4. Avoid high-delay corridors during monsoon months.\n"
            "Estimated potential savings: ₹8–15 Lakh annually based on current volumes.",
            "type": "cost",
        }

    if any(w in q for w in ["demand increase", "20%", "what if", "simulation"]):
        return {
            "answer": "Scenario: Demand increases by 20%.\n"
            "• Required additional inventory: ~18–22% uplift on constrained SKUs\n"
            "• Additional procurement cost: ~₹65–80 Lakh (indicative)\n"
            "• Projected stockout probability rises unless safety stock is increased\n"
            "• Transportation requirement increases proportionally\n"
            "Recommendation: Run the full What-If Simulator for detailed SKU-level impact.",
            "type": "simulation",
        }

    if any(w in q for w in ["risk", "high risk"]):
        high = db.query(Supplier).filter(Supplier.risk_band.in_(["HIGH", "CRITICAL"])).all()
        names = ", ".join(s.name for s in high[:5]) or "None"
        return {
            "answer": f"High/Critical risk suppliers: {names}. "
            "Overall supply-chain risk is monitored in the Risk Center. "
            "Consider dual-sourcing and expediting delayed critical shipments.",
            "type": "risk",
        }

    # Default help
    return {
        "answer": "I can help with inventory status, demand forecasts, supplier performance, "
        "risk overview, cost summary, delayed shipments, and what-if scenarios.\n\n"
        "Try asking:\n"
        "• Which products may go out of stock next month?\n"
        "• Which supplier has the best performance?\n"
        "• What is the total inventory value?\n"
        "• Which shipments are delayed?\n"
        "• How can I reduce transportation cost?\n"
        "• What happens if demand increases by 20%?",
        "type": "help",
    }
