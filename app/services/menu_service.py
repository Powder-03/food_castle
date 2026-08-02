from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import MenuItem
from app.repositories.menu_repository import MenuRepository
from app.schemas.menu import MenuItemCreate, MenuItemUpdate


class MenuService:
    def __init__(self, db: AsyncSession):
        self.repository = MenuRepository(db)

    async def create_menu_item(self, data: MenuItemCreate) -> MenuItem:
        menu_item = MenuItem(
            name=data.name,
            category=data.category.strip(),
            has_variants=data.has_variants,
            price_single=data.price_single,
            price_half=data.price_half,
            price_full=data.price_full,
            is_available=data.is_available,
        )
        return await self.repository.create(menu_item)

    async def get_menu_items(self, category: Optional[str] = None, is_available: Optional[bool] = None) -> List[MenuItem]:
        return await self.repository.get_filtered(category=category, is_available=is_available)

    async def get_categories(self) -> List[str]:
        return await self.repository.get_categories()

    async def update_menu_item(self, item_id: int, data: MenuItemUpdate) -> MenuItem:
        item = await self.repository.get_by_id(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with ID {item_id} not found."
            )

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key == "category" and isinstance(value, str):
                setattr(item, key, value.strip())
            else:
                setattr(item, key, value)

        # Validate variant structure consistency after update
        if not item.has_variants:
            if item.price_single is None or item.price_single <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Item without variants must have a valid positive price_single."
                )
        else:
            if (item.price_half is None or item.price_half <= 0) and (item.price_full is None or item.price_full <= 0):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Item with variants must specify at least one positive price option (price_half or price_full)."
                )

        return await self.repository.update(item)
