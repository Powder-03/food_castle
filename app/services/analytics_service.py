from datetime import datetime, time, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import AnalyticsSummaryResponse, TimeFrameSchema


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.repository = AnalyticsRepository(db)

    async def get_summary(self, start_date_str: Optional[str] = None, end_date_str: Optional[str] = None) -> AnalyticsSummaryResponse:
        today_utc = datetime.now(timezone.utc).date()

        if start_date_str:
            try:
                start_d = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid start_date format. Expected YYYY-MM-DD."
                )
        else:
            start_d = today_utc

        if end_date_str:
            try:
                end_d = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid end_date format. Expected YYYY-MM-DD."
                )
        else:
            end_d = today_utc

        if start_d > end_d:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_date cannot be later than end_date."
            )

        start_dt = datetime.combine(start_d, time.min).replace(tzinfo=timezone.utc)
        end_dt = datetime.combine(end_d, time.max).replace(tzinfo=timezone.utc)

        summary = await self.repository.get_sales_summary(start_dt, end_dt)
        order_type_sales = await self.repository.get_order_type_sales(start_dt, end_dt)
        admin_sales = await self.repository.get_admin_sales(start_dt, end_dt)
        category_sales = await self.repository.get_category_wise_sales(start_dt, end_dt)
        top_products = await self.repository.get_top_selling_products(start_dt, end_dt)

        return AnalyticsSummaryResponse(
            time_frame=TimeFrameSchema(
                start_date=start_d.strftime("%Y-%m-%d"),
                end_date=end_d.strftime("%Y-%m-%d"),
            ),
            total_sales=summary["total_sales"],
            total_orders=summary["total_orders"],
            average_order_value=summary["average_order_value"],
            order_type_sales=order_type_sales,
            admin_sales=admin_sales,
            category_wise_sales=category_sales,
            top_selling_products=top_products,
        )
