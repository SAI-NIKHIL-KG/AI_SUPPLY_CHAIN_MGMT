from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supply_chain import Shipment

router = APIRouter(prefix="/shipments", tags=["Logistics"])


@router.get("")
def list_shipments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    shipments = db.query(Shipment).order_by(Shipment.id.desc()).limit(100).all()
    return {
        "shipments": [
            {
                "id": s.id,
                "shipment_number": s.shipment_number,
                "origin": s.origin_city,
                "destination": s.destination_city,
                "status": s.status,
                "planned_days": s.planned_days,
                "actual_days": s.actual_days,
                "delay_flag": s.delay_flag,
                "cost": s.cost,
                "vehicle": s.vehicle,
            }
            for s in shipments
        ],
        "count": len(shipments),
    }


@router.get("/routes")
def list_routes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Aggregate by origin-destination
    rows = (
        db.query(
            Shipment.origin_city,
            Shipment.destination_city,
            func.count(Shipment.id).label("count"),
            func.sum(Shipment.cost).label("total_cost"),
            func.avg(Shipment.actual_days).label("avg_days"),
        )
        .group_by(Shipment.origin_city, Shipment.destination_city)
        .all()
    )
    return {
        "routes": [
            {
                "origin": r.origin_city,
                "destination": r.destination_city,
                "shipment_count": r.count,
                "total_cost": round(r.total_cost or 0, 2),
                "avg_transit_days": round(r.avg_days or 0, 1),
            }
            for r in rows
        ]
    }


@router.get("/delayed")
def delayed_shipments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delayed = db.query(Shipment).filter(Shipment.delay_flag == True).all()
    return {
        "delayed": [
            {
                "shipment_number": s.shipment_number,
                "origin": s.origin_city,
                "destination": s.destination_city,
                "status": s.status,
                "planned_days": s.planned_days,
                "actual_days": s.actual_days,
                "cost": s.cost,
            }
            for s in delayed
        ],
        "count": len(delayed),
    }
