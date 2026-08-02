from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, or_, cast, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.enums import OrderStatus
from app.models.order import Order, OrderItem
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, db: AsyncSession):
        super().__init__(Order, db)

    async def get_order_by_id(self, order_id: int) -> Optional[Order]:
        stmt = (
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.menu_item))
            .filter(Order.id == order_id)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_active_orders(self) -> List[Order]:
        stmt = (
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.menu_item))
            .filter(Order.status == OrderStatus.PENDING, Order.is_deleted.is_(False))
            .order_by(Order.created_at.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_order_history(
        self,
        search: Optional[str] = None,
        status: Optional[OrderStatus] = None,
        limit: int = 100,
    ) -> List[Order]:
        stmt = (
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.menu_item))
            .order_by(Order.created_at.desc())
            .limit(limit)
        )

        if status:
            stmt = stmt.filter(Order.status == status)

        if search:
            search_term = f"%{search.strip()}%"
            stmt = stmt.filter(
                or_(
                    cast(Order.id, String).ilike(search_term),
                    Order.table_number.ilike(search_term),
                    Order.created_by_admin.ilike(search_term),
                )
            )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_order_with_items(self, order: Order, items: List[OrderItem]) -> Order:
        self.db.add(order)
        await self.db.flush()  # assign order.id
        for item in items:
            item.order_id = order.id
            self.db.add(item)
        await self.db.commit()
        return await self.get_order_by_id(order.id)

    async def soft_delete_order(self, order_id: int) -> Optional[Order]:
        order = await self.get_order_by_id(order_id)
        if not order:
            return None
        order.is_deleted = True
        order.status = OrderStatus.CANCELLED
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def get_orders_in_range(self, start_time: datetime, end_time: datetime) -> List[Order]:
        stmt = (
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.menu_item))
            .filter(
                Order.created_at >= start_time,
                Order.created_at <= end_time,
                Order.is_deleted.is_(False),
            )
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
