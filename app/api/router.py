from fastapi import APIRouter

from app.api.v1.menu import router as menu_router
from app.api.v1.orders import router as orders_router
from app.api.v1.analytics import router as analytics_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(menu_router)
api_router.include_router(orders_router)
api_router.include_router(analytics_router)
