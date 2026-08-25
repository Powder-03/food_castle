export type OrderType = 'DINE_IN' | 'TAKEAWAY';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID';
export type PortionSize = 'SINGLE' | 'HALF' | 'FULL';

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  has_variants: boolean;
  price_single: number | null;
  price_half: number | null;
  price_full: number | null;
  is_available: boolean;
  created_at: string;
}

export interface MenuItemCreate {
  name: string;
  category: string;
  has_variants: boolean;
  price_single?: number | null;
  price_half?: number | null;
  price_full?: number | null;
  is_available?: boolean;
}

export interface MenuItemUpdate {
  name?: string;
  category?: string;
  has_variants?: boolean;
  price_single?: number | null;
  price_half?: number | null;
  price_full?: number | null;
  is_available?: boolean;
}

export interface OrderItemCreate {
  menu_item_id: number;
  portion_size: PortionSize;
  quantity: number;
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  portion_size: PortionSize;
  quantity: number;
  unit_price: number;
  menu_item?: MenuItem;
}

export interface OrderCreate {
  order_type: OrderType;
  table_number?: string | null;
  payment_status?: PaymentStatus;
  items: OrderItemCreate[];
}

export interface OrderUpdate {
  order_type?: OrderType;
  table_number?: string | null;
  payment_status?: PaymentStatus;
  items?: OrderItemCreate[];
}

export interface OrderStatusUpdate {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
}

export interface Order {
  id: number;
  order_type: OrderType;
  table_number: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_by_admin: string;
  created_at: string;
  completed_at: string | null;
  is_deleted?: boolean;
  items: OrderItem[];
}

export interface TimeFrame {
  start_date: string;
  end_date: string;
}

export interface RevenueCount {
  revenue: number;
  count: number;
}

export interface OrderTypeSales {
  dine_in: RevenueCount;
  takeaway: RevenueCount;
}

export interface AdminSales {
  admin: string;
  total_sales: number;
  orders_count: number;
}

export interface CategorySales {
  category: string;
  total_revenue: number;
  units_sold: number;
}

export interface TopSellingProduct {
  name: string;
  portion_size: PortionSize;
  units_sold: number;
  total_revenue: number;
}

export interface AnalyticsSummary {
  time_frame: TimeFrame;
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  order_type_sales: OrderTypeSales;
  admin_sales: AdminSales[];
  category_wise_sales: CategorySales[];
  top_selling_products: TopSellingProduct[];
}
