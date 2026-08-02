from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Numeric, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    has_variants = Column(Boolean, default=False, nullable=False)
    price_single = Column(Numeric(10, 2), nullable=True)
    price_half = Column(Numeric(10, 2), nullable=True)
    price_full = Column(Numeric(10, 2), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    order_items = relationship("OrderItem", back_populates="menu_item")
