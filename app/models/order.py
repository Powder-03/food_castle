from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import OrderType, OrderStatus, PaymentStatus, PortionSize


def utc_now():
    return datetime.now(timezone.utc)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_type = Column(SQLEnum(OrderType), nullable=False)
    table_number = Column(String(50), nullable=True)
    total_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.UNPAID, nullable=False)
    created_by_admin = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    is_deleted = Column(Boolean, default=False, server_default="false", nullable=False)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="RESTRICT"), nullable=False)
    portion_size = Column(SQLEnum(PortionSize), default=PortionSize.SINGLE, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")
