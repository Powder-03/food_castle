from decimal import Decimal
from typing import List
from pydantic import BaseModel, ConfigDict

from app.models.enums import PortionSize


class TimeFrameSchema(BaseModel):
    start_date: str
    end_date: str


class RevenueCountSchema(BaseModel):
    revenue: Decimal
    count: int


class OrderTypeSalesSchema(BaseModel):
    dine_in: RevenueCountSchema
    takeaway: RevenueCountSchema


class AdminSalesSchema(BaseModel):
    admin: str
    total_sales: Decimal
    orders_count: int


class CategorySalesSchema(BaseModel):
    category: str
    total_revenue: Decimal
    units_sold: int


class TopSellingProductSchema(BaseModel):
    name: str
    portion_size: PortionSize
    units_sold: int
    total_revenue: Decimal


class AnalyticsSummaryResponse(BaseModel):
    time_frame: TimeFrameSchema
    total_sales: Decimal
    total_orders: int
    average_order_value: Decimal
    order_type_sales: OrderTypeSalesSchema
    admin_sales: List[AdminSalesSchema]
    category_wise_sales: List[CategorySalesSchema]
    top_selling_products: List[TopSellingProductSchema]

    model_config = ConfigDict(from_attributes=True)
