"""Seed realistic Indian supply-chain synthetic data for BharatSmart Logistics Pvt. Ltd."""
import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.supply_chain import (
    Category, Product, Supplier, Warehouse, Inventory,
    Order, Shipment, DemandHistory, RiskPrediction
)
from app.core.security import get_password_hash

random.seed(42)

INDIAN_CITIES = [
    ("Bengaluru", "Karnataka", 12.9716, 77.5946),
    ("Mumbai", "Maharashtra", 19.0760, 72.8777),
    ("Delhi", "Delhi", 28.7041, 77.1025),
    ("Hyderabad", "Telangana", 17.3850, 78.4867),
    ("Chennai", "Tamil Nadu", 13.0827, 80.2707),
    ("Pune", "Maharashtra", 18.5204, 73.8567),
    ("Ahmedabad", "Gujarat", 23.0225, 72.5714),
    ("Kolkata", "West Bengal", 22.5726, 88.3639),
    ("Jaipur", "Rajasthan", 26.9124, 75.7873),
    ("Kochi", "Kerala", 9.9312, 76.2673),
]

CATEGORIES = [
    "Electronics Components", "Industrial Polymers", "Precision Parts",
    "Packaging Materials", "Automotive Spares", "Consumer Durables",
    "FMCG Ingredients", "Textile Yarn", "Pharma Intermediates", "Hardware Fittings",
]

SUPPLIER_NAMES = [
    "Omega Components Pvt Ltd", "Southern Polymers", "NorthStar Logistics Input",
    "Deccan Precision Parts", "Eastern Trade Supplies", "Bharat Polymers Hub",
    "Western Auto Spares", "Coastal Packaging Co", "Himalaya Precision",
    "Ganga Industrial Inputs", "Sahyadri Components", "Coromandel Parts",
    "Malabar Supplies", "Rajputana Traders", "Konkan Industrial",
    "Nilgiri Polymers", "Godavari Components", "Kaveri Precision",
    "Narmada Supplies", "Tapi Trade Links", "Sabarmati Inputs",
    "Yamuna Parts Co", "Chambal Industrial", "Mahanadi Supplies",
    "Brahmaputra Traders", "Godavari Spares", "Krishna Components",
    "Pennar Precision", "Tungabhadra Inputs", "Sharavathi Supplies",
]


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Users
    if db.query(User).count() == 0:
        users = [
            User(email="admin@bharatsmart.in", full_name="Admin User",
                 hashed_password=get_password_hash("admin123"), role=UserRole.ADMIN),
            User(email="manager@bharatsmart.in", full_name="Supply Chain Manager",
                 hashed_password=get_password_hash("manager123"), role=UserRole.SUPPLY_CHAIN_MANAGER),
            User(email="inventory@bharatsmart.in", full_name="Inventory Manager",
                 hashed_password=get_password_hash("inventory123"), role=UserRole.INVENTORY_MANAGER),
            User(email="logistics@bharatsmart.in", full_name="Logistics Manager",
                 hashed_password=get_password_hash("logistics123"), role=UserRole.LOGISTICS_MANAGER),
            User(email="viewer@bharatsmart.in", full_name="Viewer User",
                 hashed_password=get_password_hash("viewer123"), role=UserRole.VIEWER),
        ]
        db.add_all(users)
        print("Seeded users")

    # Categories
    if db.query(Category).count() == 0:
        cats = [Category(name=c, description=f"{c} for Indian manufacturing") for c in CATEGORIES]
        db.add_all(cats)
        db.flush()
        print(f"Seeded {len(cats)} categories")
    else:
        cats = db.query(Category).all()

    # Products
    if db.query(Product).count() == 0:
        products = []
        for i in range(1, 121):
            cat = cats[i % len(cats)]
            products.append(Product(
                sku=f"BS-{cat.name[:3].upper()}-{i:04d}",
                name=f"{cat.name} Item {i}",
                category_id=cat.id,
                hsn_code=f"{8500 + (i % 100)}",
                unit_cost=round(random.uniform(50, 5000), 2),
                lead_time_days=random.choice([3, 5, 7, 10, 14]),
            ))
        db.add_all(products)
        db.flush()
        print(f"Seeded {len(products)} products")
    else:
        products = db.query(Product).all()

    # Suppliers
    if db.query(Supplier).count() == 0:
        suppliers = []
        for i, name in enumerate(SUPPLIER_NAMES):
            city, state, _, _ = INDIAN_CITIES[i % len(INDIAN_CITIES)]
            dr = round(random.uniform(0.65, 0.98), 2)
            qs = round(random.uniform(0.70, 0.97), 2)
            ci = round(random.uniform(0.60, 0.95), 2)
            rel = round(random.uniform(0.70, 0.96), 2)
            lt = round(random.uniform(0.65, 0.95), 2)
            risk = round((1 - (0.3*dr + 0.25*qs + 0.2*ci + 0.15*rel + 0.1*lt)) * 100 + random.uniform(-5, 15), 1)
            risk = max(5, min(95, risk))
            if risk <= 30:
                band = "LOW"
            elif risk <= 60:
                band = "MEDIUM"
            elif risk <= 80:
                band = "HIGH"
            else:
                band = "CRITICAL"
            suppliers.append(Supplier(
                name=name, city=city, state=state,
                gstin=f"29AABCT{1000+i}R1Z{i%10}",
                delivery_reliability=dr, quality_score=qs, cost_index=ci,
                reliability=rel, lead_time_consistency=lt,
                risk_score=risk, risk_band=band,
            ))
        db.add_all(suppliers)
        print(f"Seeded {len(suppliers)} suppliers")

    # Warehouses
    if db.query(Warehouse).count() == 0:
        warehouses = []
        for city, state, lat, lng in INDIAN_CITIES:
            warehouses.append(Warehouse(
                name=f"BS Warehouse – {city}",
                city=city, state=state,
                capacity=random.randint(8000, 25000),
                utilization=round(random.uniform(0.45, 0.88), 2),
                lat=lat, lng=lng,
            ))
        # Extra hubs
        warehouses.append(Warehouse(name="BS Hub – Coimbatore", city="Coimbatore", state="Tamil Nadu",
                                    capacity=12000, utilization=0.62, lat=11.0168, lng=76.9558))
        warehouses.append(Warehouse(name="BS Hub – Indore", city="Indore", state="Madhya Pradesh",
                                    capacity=15000, utilization=0.71, lat=22.7196, lng=75.8577))
        warehouses.append(Warehouse(name="BS Hub – Lucknow", city="Lucknow", state="Uttar Pradesh",
                                    capacity=11000, utilization=0.58, lat=26.8467, lng=80.9462))
        db.add_all(warehouses)
        db.flush()
        print(f"Seeded {len(warehouses)} warehouses")
    else:
        warehouses = db.query(Warehouse).all()

    # Inventory
    if db.query(Inventory).count() == 0:
        inv_items = []
        for p in products:
            for w in random.sample(warehouses, k=random.randint(2, 5)):
                qty = random.randint(10, 800)
                ss = random.randint(30, 120)
                rop = ss + random.randint(40, 150)
                eoq = random.randint(100, 400)
                if qty < ss * 0.5:
                    status = "Critical"
                    sp = round(random.uniform(0.35, 0.75), 2)
                elif qty < rop:
                    status = "Low Stock"
                    sp = round(random.uniform(0.15, 0.35), 2)
                elif qty > eoq * 2.5:
                    status = "Overstock"
                    sp = round(random.uniform(0.01, 0.05), 2)
                else:
                    status = "Healthy"
                    sp = round(random.uniform(0.02, 0.12), 2)
                inv_items.append(Inventory(
                    product_id=p.id, warehouse_id=w.id,
                    quantity_on_hand=qty, safety_stock=ss, reorder_point=rop,
                    eoq=eoq, stockout_probability=sp, status=status,
                ))
        db.add_all(inv_items)
        print(f"Seeded {len(inv_items)} inventory records")

    # Orders
    if db.query(Order).count() == 0:
        orders = []
        statuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]
        for i in range(1, 501):
            city, _, _, _ = random.choice(INDIAN_CITIES)
            orders.append(Order(
                order_number=f"ORD-2024-{i:05d}",
                customer_name=f"Customer {i}",
                city=city,
                order_date=date.today() - timedelta(days=random.randint(0, 120)),
                status=random.choices(statuses, weights=[15, 20, 25, 35, 5])[0],
                total_amount=round(random.uniform(5000, 250000), 2),
            ))
        db.add_all(orders)
        print(f"Seeded {len(orders)} orders")

    # Shipments
    if db.query(Shipment).count() == 0:
        shipments = []
        for i in range(1, 301):
            o = random.choice(INDIAN_CITIES)
            d = random.choice(INDIAN_CITIES)
            while d[0] == o[0]:
                d = random.choice(INDIAN_CITIES)
            planned = random.randint(2, 7)
            delay = random.random() < 0.12
            actual = planned + (random.randint(1, 4) if delay else 0)
            status = "Delayed" if delay else random.choice(["In Transit", "Delivered", "Planned"])
            shipments.append(Shipment(
                shipment_number=f"SHP-2024-{i:05d}",
                origin_city=o[0], destination_city=d[0],
                status=status, planned_days=planned, actual_days=actual,
                delay_flag=delay,
                cost=round(random.uniform(8000, 85000), 2),
                vehicle=random.choice(["TATA-407", "ASHOK-L", "BHARAT-BENZ", "EICHER-PRO"]),
            ))
        db.add_all(shipments)
        print(f"Seeded {len(shipments)} shipments")

    # Demand history (sample)
    if db.query(DemandHistory).count() == 0:
        hist = []
        sample_products = products[:40]
        sample_wh = warehouses[:8]
        for p in sample_products:
            for w in sample_wh:
                base = random.randint(20, 150)
                for day_offset in range(60, 0, -1):
                    d = date.today() - timedelta(days=day_offset)
                    seasonal = 1.2 if d.month in (10, 11) else (1.1 if d.weekday() >= 5 else 1.0)
                    qty = max(0, int(base * seasonal * random.uniform(0.7, 1.3)))
                    hist.append(DemandHistory(
                        product_id=p.id, warehouse_id=w.id,
                        demand_date=d, quantity=qty,
                    ))
        db.add_all(hist)
        print(f"Seeded {len(hist)} demand history records")

    # Risk predictions (flush so earlier inserts are visible to queries)
    db.flush()
    if db.query(RiskPrediction).count() == 0:
        preds = []
        # Prefer HIGH/CRITICAL; fall back to MEDIUM so demo always has supplier risks
        high_suppliers = db.query(Supplier).filter(
            Supplier.risk_band.in_(["HIGH", "CRITICAL"])
        ).all()
        if not high_suppliers:
            high_suppliers = (
                db.query(Supplier)
                .filter(Supplier.risk_band == "MEDIUM")
                .order_by(Supplier.risk_score.desc())
                .limit(8)
                .all()
            )
        for s in high_suppliers:
            preds.append(RiskPrediction(
                entity_type="supplier", entity_id=s.id, entity_name=s.name,
                risk_score=s.risk_score, risk_band=s.risk_band,
                recommendation="Dual-source or shift volume to next-best qualified supplier",
            ))
        for inv in db.query(Inventory).filter(Inventory.status == "Critical").limit(15).all():
            preds.append(RiskPrediction(
                entity_type="inventory", entity_id=inv.id,
                entity_name=f"SKU inventory #{inv.id}",
                risk_score=round(inv.stockout_probability * 100, 1),
                risk_band="CRITICAL" if inv.stockout_probability > 0.5 else "HIGH",
                recommendation="Place emergency PO and increase safety stock",
            ))
        db.add_all(preds)
        print(f"Seeded {len(preds)} risk predictions")

    db.commit()
    db.close()
    print("Seed complete.")


if __name__ == "__main__":
    seed()
