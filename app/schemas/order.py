from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import OrderType, OrderStatus, PaymentStatus, PortionSize
from app.schemas.menu import MenuItemResponse


class OrderItemCreate(BaseModel):
    menu_item_id: int = Field(..., gt=0)
    portion_size: PortionSize = PortionSize.SINGLE
    quantity: int = Field(default=1, gt=0)


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    portion_size: PortionSize
    quantity: int
    unit_price: Decimal
    menu_item: Optional[MenuItemResponse] = None

    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    order_type: OrderType
    table_number: Optional[str] = Field(default=None, max_length=50)
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderStatusUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None


class OrderResponse(BaseModel):
    id: int
    order_type: OrderType
    table_number: Optional[str] = None
    total_amount: Decimal
    status: OrderStatus
    payment_status: PaymentStatus
    created_by_admin: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
