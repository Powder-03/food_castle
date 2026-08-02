from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Any
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import OrderStatus, OrderType
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem


class AnalyticsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_sales_summary(self, start_time: datetime, end_time: datetime) -> Dict[str, Any]:
        stmt = (
            select(
                func.coalesce(func.sum(Order.total_amount), 0).label("total_sales"),
                func.count(Order.id).label("total_orders"),
            )
            .filter(
                Order.status == OrderStatus.COMPLETED,
                Order.is_deleted.is_(False),
                Order.created_at >= start_time,
                Order.created_at <= end_time,
            )
        )
        result = (await self.db.execute(stmt)).first()

        total_sales = Decimal(str(result.total_sales)) if result else Decimal("0.00")
        total_orders = result.total_orders if result else 0
        aov = (total_sales / Decimal(total_orders)) if total_orders > 0 else Decimal("0.00")

        return {
            "total_sales": round(total_sales, 2),
            "total_orders": total_orders,
            "average_order_value": round(aov, 2),
        }

    async def get_order_type_sales(self, start_time: datetime, end_time: datetime) -> Dict[str, Any]:
        stmt = (
            select(
                Order.order_type,
                func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
                func.count(Order.id).label("count"),
            )
            .filter(
                Order.status == OrderStatus.COMPLETED,
                Order.is_deleted.is_(False),
                Order.created_at >= start_time,
                Order.created_at <= end_time,
            )
            .group_by(Order.order_type)
        )
        results = (await self.db.execute(stmt)).all()

        sales_map = {
            "dine_in": {"revenue": Decimal("0.00"), "count": 0},
            "takeaway": {"revenue": Decimal("0.00"), "count": 0},
        }

        for row in results:
            key = "dine_in" if row.order_type == OrderType.DINE_IN else "takeaway"
            sales_map[key] = {
                "revenue": round(Decimal(str(row.revenue)), 2),
                "count": row.count,
            }

        return sales_map

    async def get_admin_sales(self, start_time: datetime, end_time: datetime) -> List[Dict[str, Any]]:
        stmt = (
            select(
                Order.created_by_admin,
                func.coalesce(func.sum(Order.total_amount), 0).label("total_sales"),
                func.count(Order.id).label("orders_count"),
            )
            .filter(
                Order.status == OrderStatus.COMPLETED,
                Order.is_deleted.is_(False),
                Order.created_at >= start_time,
                Order.created_at <= end_time,
            )
            .group_by(Order.created_by_admin)
        )
        results = (await self.db.execute(stmt)).all()

        return [
            {
                "admin": row.created_by_admin,
                "total_sales": round(Decimal(str(row.total_sales)), 2),
                "orders_count": row.orders_count,
            }
            for row in results
        ]

    async def get_category_wise_sales(self, start_time: datetime, end_time: datetime) -> List[Dict[str, Any]]:
        stmt = (
            select(
                MenuItem.category,
                func.coalesce(func.sum(OrderItem.quantity * OrderItem.unit_price), 0).label("total_revenue"),
                func.coalesce(func.sum(OrderItem.quantity), 0).label("units_sold"),
            )
            .join(OrderItem, MenuItem.id == OrderItem.menu_item_id)
            .join(Order, OrderItem.order_id == Order.id)
            .filter(
                Order.status == OrderStatus.COMPLETED,
                Order.is_deleted.is_(False),
                Order.created_at >= start_time,
                Order.created_at <= end_time,
            )
            .group_by(MenuItem.category)
            .order_by(func.sum(OrderItem.quantity * OrderItem.unit_price).desc())
        )
        results = (await self.db.execute(stmt)).all()

        return [
            {
                "category": row.category,
                "total_revenue": round(Decimal(str(row.total_revenue)), 2),
                "units_sold": int(row.units_sold),
            }
            for row in results
        ]

    async def get_top_selling_products(self, start_time: datetime, end_time: datetime, limit: int = 10) -> List[Dict[str, Any]]:
        stmt = (
            select(
                MenuItem.name,
                OrderItem.portion_size,
                func.coalesce(func.sum(OrderItem.quantity), 0).label("units_sold"),
                func.coalesce(func.sum(OrderItem.quantity * OrderItem.unit_price), 0).label("total_revenue"),
            )
            .join(OrderItem, MenuItem.id == OrderItem.menu_item_id)
            .join(Order, OrderItem.order_id == Order.id)
            .filter(
                Order.status == OrderStatus.COMPLETED,
                Order.is_deleted.is_(False),
                Order.created_at >= start_time,
                Order.created_at <= end_time,
            )
            .group_by(MenuItem.name, OrderItem.portion_size)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(limit)
        )
        results = (await self.db.execute(stmt)).all()

        return [
            {
                "name": row.name,
                "portion_size": row.portion_size,
                "units_sold": int(row.units_sold),
                "total_revenue": round(Decimal(str(row.total_revenue)), 2),
            }
            for row in results
        ]
