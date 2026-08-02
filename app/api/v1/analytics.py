from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_admin
from app.core.database import get_db
from app.schemas.analytics import AnalyticsSummaryResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Operational Analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def get_analytics_summary(
    start_date: Optional[str] = Query(default=None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(default=None, description="End date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = AnalyticsService(db)
    return await service.get_summary(start_date_str=start_date, end_date_str=end_date)
