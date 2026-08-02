from enum import Enum


class OrderType(str, Enum):
    DINE_IN = "DINE_IN"
    TAKEAWAY = "TAKEAWAY"


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PaymentStatus(str, Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"


class PortionSize(str, Enum):
    SINGLE = "SINGLE"
    HALF = "HALF"
    FULL = "FULL"
