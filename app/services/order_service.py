from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import OrderStatus, PaymentStatus, PortionSize
from app.models.order import Order, OrderItem
from app.repositories.menu_repository import MenuRepository
from app.repositories.order_repository import OrderRepository
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderUpdate, OrderItemCreate


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.menu_repo = MenuRepository(db)

    async def _build_order_items(self, items_data: List[OrderItemCreate]):
        menu_item_ids = [item.menu_item_id for item in items_data]
        fetched_items = await self.menu_repo.get_by_ids(menu_item_ids)
        db_menu_items = {m.id: m for m in fetched_items}

        order_items: List[OrderItem] = []
        calculated_total = Decimal("0.00")

        for item_data in items_data:
            menu_item = db_menu_items.get(item_data.menu_item_id)
            if not menu_item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Menu item with ID {item_data.menu_item_id} not found."
                )
            if not menu_item.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Menu item '{menu_item.name}' is currently unavailable."
                )

            # Calculate unit price based on portion size snapshot
            unit_price: Decimal
            if item_data.portion_size == PortionSize.SINGLE:
                if menu_item.price_single is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Single portion price not configured for item '{menu_item.name}'."
                    )
                unit_price = Decimal(str(menu_item.price_single))
            elif item_data.portion_size == PortionSize.HALF:
                if menu_item.price_half is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Half portion price not configured for item '{menu_item.name}'."
                    )
                unit_price = Decimal(str(menu_item.price_half))
            elif item_data.portion_size == PortionSize.FULL:
                if menu_item.price_full is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Full portion price not configured for item '{menu_item.name}'."
                    )
                unit_price = Decimal(str(menu_item.price_full))
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid portion size '{item_data.portion_size}'."
                )

            line_total = unit_price * item_data.quantity
            calculated_total += line_total

            order_item = OrderItem(
                menu_item_id=menu_item.id,
                portion_size=item_data.portion_size,
                quantity=item_data.quantity,
                unit_price=unit_price,
            )
            order_items.append(order_item)

        return order_items, calculated_total

    async def create_order(self, data: OrderCreate, current_admin: str) -> Order:
        order_items, calculated_total = await self._build_order_items(data.items)

        order = Order(
            order_type=data.order_type,
            table_number=data.table_number if data.order_type == OrderType.DINE_IN else None,
            total_amount=round(calculated_total, 2),
            status=OrderStatus.PENDING,
            payment_status=data.payment_status or PaymentStatus.UNPAID,
            created_by_admin=current_admin,
            is_deleted=False,
        )

        return await self.order_repo.create_order_with_items(order, order_items)

    async def update_order(self, order_id: int, data: OrderUpdate) -> Order:
        order = await self.order_repo.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found."
            )

        if order.is_deleted or order.status == OrderStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot edit a cancelled or deleted order."
            )

        new_items = None
        if data.items is not None:
            new_items, calculated_total = await self._build_order_items(data.items)
            order.total_amount = round(calculated_total, 2)

        if data.order_type is not None:
            order.order_type = data.order_type

        if data.table_number is not None:
            effective_order_type = data.order_type if data.order_type is not None else order.order_type
            order.table_number = data.table_number if effective_order_type == OrderType.DINE_IN else None

        if data.payment_status is not None:
            order.payment_status = data.payment_status

        return await self.order_repo.update_order_with_items(order, new_items)

    async def get_active_orders(self) -> List[Order]:
        return await self.order_repo.get_active_orders()

    async def get_order_history(
        self,
        search: Optional[str] = None,
        status: Optional[OrderStatus] = None,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> List[Order]:
        return await self.order_repo.get_order_history(
            search=search, status=status, limit=limit, include_deleted=include_deleted
        )

    async def soft_delete_order(self, order_id: int) -> Order:
        order = await self.order_repo.soft_delete_order(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found."
            )
        return order

    async def update_order_status(self, order_id: int, status_update: OrderStatusUpdate) -> Order:
        order = await self.order_repo.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found."
            )

        if status_update.status is not None:
            order.status = status_update.status
            if status_update.status == OrderStatus.COMPLETED:
                order.completed_at = datetime.now(timezone.utc)
                if status_update.payment_status is None:
                    order.payment_status = PaymentStatus.PAID

        if status_update.payment_status is not None:
            order.payment_status = status_update.payment_status

        return await self.order_repo.update(order)
