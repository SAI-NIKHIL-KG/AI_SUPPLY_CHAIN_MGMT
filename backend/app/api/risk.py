from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supply_chain import Supplier, Inventory, Shipment, RiskPrediction

router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("/overview")
def risk_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suppliers = db.query(Supplier).all()
    high_sup = [s for s in suppliers if s.risk_band in ("HIGH", "CRITICAL")]
    critical_inv = db.query(Inventory).filter(Inventory.status == "Critical").count()
    delayed = db.query(Shipment).filter(Shipment.delay_flag == True).count()

    # Overall risk score (simple aggregate)
    avg_supplier_risk = (
        sum(s.risk_score for s in suppliers) / len(suppliers) if suppliers else 30
    )
    inv_risk = min(100, critical_inv * 8)
    delay_risk = min(100, delayed * 5)
    overall = round(0.4 * avg_supplier_risk + 0.35 * inv_risk + 0.25 * delay_risk, 1)

    if overall <= 30:
        band = "LOW"
    elif overall <= 60:
        band = "MEDIUM"
    elif overall <= 80:
        band = "HIGH"
    else:
        band = "CRITICAL"

    return {
        "overall_risk_score": overall,
        "overall_risk_band": band,
        "supplier_risk": {
            "high_critical_count": len(high_sup),
            "avg_score": round(avg_supplier_risk, 1),
            "items": [
                {"name": s.name, "city": s.city, "risk_score": s.risk_score, "risk_band": s.risk_band}
                for s in high_sup
            ],
        },
        "inventory_risk": {"critical_count": critical_inv},
        "delivery_risk": {"delayed_count": delayed},
        "mitigation_recommendations": [
            "Dual-source high-risk SKUs from alternative suppliers",
            "Expedite delayed critical shipments on high-priority lanes",
            "Increase safety stock for volatile seasonal categories",
            "Review warehouse capacity for peak festival demand",
        ],
    }


@router.get("/predictions")
def risk_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preds = db.query(RiskPrediction).order_by(RiskPrediction.risk_score.desc()).limit(50).all()
    return {
        "predictions": [
            {
                "entity_type": p.entity_type,
                "entity_name": p.entity_name,
                "risk_score": p.risk_score,
                "risk_band": p.risk_band,
                "recommendation": p.recommendation,
            }
            for p in preds
        ]
    }
