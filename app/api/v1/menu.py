from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_admin
from app.core.database import get_db
from app.schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemResponse
from app.services.menu_service import MenuService

router = APIRouter(prefix="/menu", tags=["Menu Management"])


@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    payload: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = MenuService(db)
    return await service.create_menu_item(payload)


@router.get("", response_model=List[MenuItemResponse])
async def list_menu_items(
    category: Optional[str] = Query(default=None, description="Filter menu items by category name"),
    is_available: Optional[bool] = Query(default=None, description="Filter menu items by availability"),
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = MenuService(db)
    return await service.get_menu_items(category=category, is_available=is_available)


@router.get("/categories", response_model=List[str])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = MenuService(db)
    return await service.get_categories()


@router.patch("/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: int,
    payload: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    service = MenuService(db)
    return await service.update_menu_item(item_id=item_id, data=payload)
