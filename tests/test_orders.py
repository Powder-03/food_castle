import pytest

AUTH_ADMIN_1 = ("i", "admin1pass")
AUTH_ADMIN_2 = ("a", "admin2pass")


def test_create_order_server_side_pricing(client):
    # Setup menu items
    res_m1 = client.post("/api/v1/menu", json={"name": "Cold Coffee", "category": "Beverages", "price_single": 100.00}, auth=AUTH_ADMIN_1)
    res_m2 = client.post("/api/v1/menu", json={"name": "Pizza", "category": "Mains", "has_variants": True, "price_half": 150.00, "price_full": 280.00}, auth=AUTH_ADMIN_1)

    item1_id = res_m1.json()["id"]
    item2_id = res_m2.json()["id"]

    order_payload = {
        "order_type": "DINE_IN",
        "table_number": "Table 4",
        "items": [
            {"menu_item_id": item1_id, "portion_size": "SINGLE", "quantity": 2},  # 2 * 100 = 200
            {"menu_item_id": item2_id, "portion_size": "HALF", "quantity": 1},    # 1 * 150 = 150
        ]
    }

    res_order = client.post("/api/v1/orders", json=order_payload, auth=AUTH_ADMIN_1)
    assert res_order.status_code == 201
    data = res_order.json()

    assert data["order_type"] == "DINE_IN"
    assert data["table_number"] == "Table 4"
    assert float(data["total_amount"]) == 350.00
    assert data["status"] == "PENDING"
    assert data["payment_status"] == "UNPAID"
    assert data["created_by_admin"] == "i"
    assert len(data["items"]) == 2


def test_create_order_tagged_with_admin_2(client):
    res_m1 = client.post("/api/v1/menu", json={"name": "Sandwich", "category": "Snacks", "price_single": 80.00}, auth=AUTH_ADMIN_1)
    item_id = res_m1.json()["id"]

    order_payload = {
        "order_type": "TAKEAWAY",
        "items": [{"menu_item_id": item_id, "portion_size": "SINGLE", "quantity": 1}]
    }

    res_order = client.post("/api/v1/orders", json=order_payload, auth=AUTH_ADMIN_2)
    assert res_order.status_code == 201
    assert res_order.json()["created_by_admin"] == "a"


def test_active_kitchen_queue_and_status_update(client):
    res_m = client.post("/api/v1/menu", json={"name": "Pasta", "category": "Mains", "price_single": 200.00}, auth=AUTH_ADMIN_1)
    item_id = res_m.json()["id"]

    order1 = client.post("/api/v1/orders", json={"order_type": "DINE_IN", "items": [{"menu_item_id": item_id, "quantity": 1}]}, auth=AUTH_ADMIN_1).json()
    order2 = client.post("/api/v1/orders", json={"order_type": "TAKEAWAY", "items": [{"menu_item_id": item_id, "quantity": 2}]}, auth=AUTH_ADMIN_1).json()

    # Get active queue
    res_active = client.get("/api/v1/orders/active", auth=AUTH_ADMIN_1)
    assert res_active.status_code == 200
    active_ids = [o["id"] for o in res_active.json()]
    assert active_ids == [order1["id"], order2["id"]]

    # Complete order 1
    res_status = client.patch(f"/api/v1/orders/{order1['id']}/status", json={"status": "COMPLETED"}, auth=AUTH_ADMIN_1)
    assert res_status.status_code == 200
    updated_o1 = res_status.json()
    assert updated_o1["status"] == "COMPLETED"
    assert updated_o1["payment_status"] == "PAID"
    assert updated_o1["completed_at"] is not None

    # Check active queue again (order 1 should be removed)
    res_active_2 = client.get("/api/v1/orders/active", auth=AUTH_ADMIN_1)
    active_ids_2 = [o["id"] for o in res_active_2.json()]
    assert active_ids_2 == [order2["id"]]
