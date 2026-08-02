from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
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
            .filter(Order.status == OrderStatus.PENDING)
            .order_by(Order.created_at.asc())
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

    async def get_orders_in_range(self, start_time: datetime, end_time: datetime) -> List[Order]:
        stmt = (
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.menu_item))
            .filter(Order.created_at >= start_time, Order.created_at <= end_time)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
