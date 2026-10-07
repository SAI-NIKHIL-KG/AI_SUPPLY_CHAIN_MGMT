from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supply_chain import Supplier

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("")
def list_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suppliers = db.query(Supplier).filter(Supplier.is_active == True).all()
    result = []
    for s in suppliers:
        composite = (
            0.30 * s.delivery_reliability
            + 0.25 * s.quality_score
            + 0.20 * s.cost_index
            + 0.15 * s.reliability
            + 0.10 * s.lead_time_consistency
        ) * 100
        result.append({
            "id": s.id,
            "name": s.name,
            "city": s.city,
            "state": s.state,
            "gstin": s.gstin,
            "delivery_reliability": s.delivery_reliability,
            "quality_score": s.quality_score,
            "cost_index": s.cost_index,
            "reliability": s.reliability,
            "lead_time_consistency": s.lead_time_consistency,
            "composite_score": round(composite, 1),
            "risk_score": s.risk_score,
            "risk_band": s.risk_band,
        })
    return {"suppliers": result, "count": len(result)}


@router.get("/performance")
def supplier_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_suppliers(db, current_user)


@router.get("/recommendation")
def supplier_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suppliers = db.query(Supplier).filter(Supplier.is_active == True).all()
    ranked = sorted(
        suppliers,
        key=lambda s: (
            0.30 * s.delivery_reliability
            + 0.25 * s.quality_score
            + 0.20 * s.cost_index
            + 0.15 * s.reliability
            + 0.10 * s.lead_time_consistency
        ),
        reverse=True,
    )
    top = ranked[:5]
    high_risk = [s for s in suppliers if s.risk_band in ("HIGH", "CRITICAL")]
    return {
        "top_suppliers": [
            {
                "name": s.name,
                "city": s.city,
                "risk_band": s.risk_band,
                "composite_score": round(
                    (
                        0.30 * s.delivery_reliability
                        + 0.25 * s.quality_score
                        + 0.20 * s.cost_index
                        + 0.15 * s.reliability
                        + 0.10 * s.lead_time_consistency
                    )
                    * 100,
                    1,
                ),
            }
            for s in top
        ],
        "high_risk_alert": [
            {
                "name": s.name,
                "city": s.city,
                "risk_band": s.risk_band,
                "recommendation": "Consider dual-sourcing or volume shift",
            }
            for s in high_risk
        ],
    }
