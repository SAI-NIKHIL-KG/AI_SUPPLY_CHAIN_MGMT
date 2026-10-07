from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Date
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    hsn_code = Column(String(20), nullable=True)
    unit_cost = Column(Float, nullable=False)  # INR
    lead_time_days = Column(Integer, default=7)
    category = relationship("Category", back_populates="products")
    inventory_items = relationship("Inventory", back_populates="product")


class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    gstin = Column(String(20), nullable=True)
    delivery_reliability = Column(Float, default=0.85)
    quality_score = Column(Float, default=0.85)
    cost_index = Column(Float, default=0.80)
    reliability = Column(Float, default=0.85)
    lead_time_consistency = Column(Float, default=0.80)
    risk_score = Column(Float, default=25.0)
    risk_band = Column(String(20), default="LOW")
    is_active = Column(Boolean, default=True)


class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    capacity = Column(Integer, default=10000)
    utilization = Column(Float, default=0.65)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    inventory_items = relationship("Inventory", back_populates="warehouse")


class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity_on_hand = Column(Integer, default=0)
    safety_stock = Column(Integer, default=50)
    reorder_point = Column(Integer, default=100)
    eoq = Column(Integer, default=200)
    stockout_probability = Column(Float, default=0.05)
    status = Column(String(30), default="Healthy")  # Healthy, Low Stock, Critical, Overstock
    product = relationship("Product", back_populates="inventory_items")
    warehouse = relationship("Warehouse", back_populates="inventory_items")


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True)
    customer_name = Column(String(200), nullable=True)
    city = Column(String(100), nullable=True)
    order_date = Column(Date, nullable=False)
    status = Column(String(50), default="Pending")  # Pending, Confirmed, Shipped, Delivered, Cancelled
    total_amount = Column(Float, default=0.0)  # INR
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    shipment_number = Column(String(50), unique=True, index=True)
    origin_city = Column(String(100), nullable=False)
    destination_city = Column(String(100), nullable=False)
    status = Column(String(50), default="In Transit")  # Planned, In Transit, Delivered, Delayed
    planned_days = Column(Integer, default=3)
    actual_days = Column(Integer, nullable=True)
    delay_flag = Column(Boolean, default=False)
    cost = Column(Float, default=0.0)  # INR
    vehicle = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DemandHistory(Base):
    __tablename__ = "demand_history"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    demand_date = Column(Date, nullable=False)
    quantity = Column(Integer, default=0)


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False)  # supplier, inventory, shipment, overall
    entity_id = Column(Integer, nullable=True)
    entity_name = Column(String(200), nullable=True)
    risk_score = Column(Float, default=0.0)
    risk_band = Column(String(20), default="LOW")
    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
