from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    has_variants: bool = False
    price_single: Optional[Decimal] = Field(default=None, ge=0)
    price_half: Optional[Decimal] = Field(default=None, ge=0)
    price_full: Optional[Decimal] = Field(default=None, ge=0)
    is_available: bool = True


class MenuItemCreate(MenuItemBase):
    @model_validator(mode="after")
    def validate_pricing_structure(self):
        if not self.has_variants:
            if self.price_single is None or self.price_single <= 0:
                raise ValueError("Items without variants must have a valid positive price_single.")
        else:
            if (self.price_half is None or self.price_half <= 0) and (self.price_full is None or self.price_full <= 0):
                raise ValueError("Items with variants must specify at least one positive price option (price_half or price_full).")
        return self


class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    has_variants: Optional[bool] = None
    price_single: Optional[Decimal] = Field(default=None, ge=0)
    price_half: Optional[Decimal] = Field(default=None, ge=0)
    price_full: Optional[Decimal] = Field(default=None, ge=0)
    is_available: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
