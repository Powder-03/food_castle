import pytest
from datetime import datetime, timezone

AUTH_ADMIN_1 = ("i", "admin1pass")
AUTH_ADMIN_2 = ("a", "admin2pass")


def test_analytics_summary_endpoint(client):
    # 1. Create Menu Items
    m1 = client.post("/api/v1/menu", json={"name": "Cold Coffee", "category": "Beverages", "price_single": 100.00}, auth=AUTH_ADMIN_1).json()
    m2 = client.post("/api/v1/menu", json={"name": "Paneer Tikka", "category": "Mains", "has_variants": True, "price_half": 120.00, "price_full": 220.00}, auth=AUTH_ADMIN_1).json()

    # 2. Admin 1 creates Order 1 (DINE_IN) -> Total = 100 + 120 = 220
    o1 = client.post(
        "/api/v1/orders",
        json={
            "order_type": "DINE_IN",
            "table_number": "Table 1",
            "items": [
                {"menu_item_id": m1["id"], "portion_size": "SINGLE", "quantity": 1},
                {"menu_item_id": m2["id"], "portion_size": "HALF", "quantity": 1},
            ],
        },
        auth=AUTH_ADMIN_1,
    ).json()

    # 3. Admin 2 creates Order 2 (TAKEAWAY) -> Total = 2 * 100 = 200
    o2 = client.post(
        "/api/v1/orders",
        json={
            "order_type": "TAKEAWAY",
            "items": [
                {"menu_item_id": m1["id"], "portion_size": "SINGLE", "quantity": 2},
            ],
        },
        auth=AUTH_ADMIN_2,
    ).json()

    # Mark both orders as COMPLETED
    client.patch(f"/api/v1/orders/{o1['id']}/status", json={"status": "COMPLETED"}, auth=AUTH_ADMIN_1)
    client.patch(f"/api/v1/orders/{o2['id']}/status", json={"status": "COMPLETED"}, auth=AUTH_ADMIN_2)

    # 4. Fetch Analytics Summary
    response = client.get("/api/v1/analytics/summary", auth=AUTH_ADMIN_1)
    assert response.status_code == 200
    data = response.json()

    # Time frame check
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    assert data["time_frame"]["start_date"] == today_str
    assert data["time_frame"]["end_date"] == today_str

    # Total sales = 220 + 200 = 420.00
    assert float(data["total_sales"]) == 420.00
    assert data["total_orders"] == 2
    assert float(data["average_order_value"]) == 210.00

    # Order type sales check
    assert float(data["order_type_sales"]["dine_in"]["revenue"]) == 220.00
    assert data["order_type_sales"]["dine_in"]["count"] == 1
    assert float(data["order_type_sales"]["takeaway"]["revenue"]) == 200.00
    assert data["order_type_sales"]["takeaway"]["count"] == 1

    # Admin sales check
    admins = {item["admin"]: item for item in data["admin_sales"]}
    assert "i" in admins
    assert "a" in admins
    assert float(admins["i"]["total_sales"]) == 220.00
    assert admins["i"]["orders_count"] == 1
    assert float(admins["a"]["total_sales"]) == 200.00
    assert admins["a"]["orders_count"] == 1

    # Category wise sales check
    categories = {item["category"]: item for item in data["category_wise_sales"]}
    assert "Beverages" in categories
    assert "Mains" in categories
    assert float(categories["Beverages"]["total_revenue"]) == 300.00
    assert categories["Beverages"]["units_sold"] == 3
    assert float(categories["Mains"]["total_revenue"]) == 120.00
    assert categories["Mains"]["units_sold"] == 1

    # Top selling products check
    top_products = data["top_selling_products"]
    assert len(top_products) >= 2
    # Cold Coffee (SINGLE) sold 3 units
    assert top_products[0]["name"] == "Cold Coffee"
    assert top_products[0]["units_sold"] == 3
