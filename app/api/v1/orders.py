from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_admin
from app.core.database import get_db
from app.models.enums import OrderStatus
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Order Lifecycle & Kitchen Queue"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = OrderService(db)
    return await service.create_order(data=payload, current_admin=admin)


@router.get("/active", response_model=List[OrderResponse])
async def get_active_orders(
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = OrderService(db)
    return await service.get_active_orders()


@router.get("/history", response_model=List[OrderResponse])
async def get_order_history(
    search: Optional[str] = Query(default=None, description="Search by Order ID, Table #, or Admin name"),
    status: Optional[OrderStatus] = Query(default=None, description="Filter by status (PENDING, COMPLETED, CANCELLED)"),
    limit: int = Query(default=100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = OrderService(db)
    return await service.get_order_history(search=search, status=status, limit=limit)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = OrderService(db)
    return await service.update_order_status(order_id=order_id, status_update=payload)


@router.delete("/{order_id}", response_model=OrderResponse)
async def soft_delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = OrderService(db)
    return await service.soft_delete_order(order_id=order_id)
