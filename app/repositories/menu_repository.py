from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import MenuItem
from app.repositories.base import BaseRepository


class MenuRepository(BaseRepository[MenuItem]):
    def __init__(self, db: AsyncSession):
        super().__init__(MenuItem, db)

    async def get_filtered(self, category: Optional[str] = None, is_available: Optional[bool] = None) -> List[MenuItem]:
        stmt = select(MenuItem)
        if category:
            stmt = stmt.filter(MenuItem.category.ilike(f"%{category}%"))
        if is_available is not None:
            stmt = stmt.filter(MenuItem.is_available == is_available)
        stmt = stmt.order_by(MenuItem.category, MenuItem.name)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_ids(self, ids: List[int]) -> List[MenuItem]:
        if not ids:
            return []
        stmt = select(MenuItem).filter(MenuItem.id.in_(ids))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
