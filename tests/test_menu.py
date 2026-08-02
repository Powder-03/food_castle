import pytest

AUTH_ADMIN_1 = ("i", "admin1pass")


def test_create_single_price_menu_item(client):
    payload = {
        "name": "Cold Coffee",
        "category": "Beverages",
        "has_variants": False,
        "price_single": 150.00,
        "is_available": True,
    }
    response = client.post("/api/v1/menu", json=payload, auth=AUTH_ADMIN_1)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Cold Coffee"
    assert data["category"] == "Beverages"
    assert float(data["price_single"]) == 150.00


def test_create_variant_menu_item(client):
    payload = {
        "name": "Paneer Tikka",
        "category": "Mains",
        "has_variants": True,
        "price_half": 180.00,
        "price_full": 320.00,
        "is_available": True,
    }
    response = client.post("/api/v1/menu", json=payload, auth=AUTH_ADMIN_1)
    assert response.status_code == 201
    data = response.json()
    assert data["has_variants"] is True
    assert float(data["price_half"]) == 180.00
    assert float(data["price_full"]) == 320.00


def test_list_and_filter_menu_items(client):
    # Create two items
    client.post("/api/v1/menu", json={"name": "Tea", "category": "Beverages", "price_single": 40.00}, auth=AUTH_ADMIN_1)
    client.post("/api/v1/menu", json={"name": "Burger", "category": "Snacks", "price_single": 120.00, "is_available": False}, auth=AUTH_ADMIN_1)

    # List all
    res_all = client.get("/api/v1/menu", auth=AUTH_ADMIN_1)
    assert len(res_all.json()) == 2

    # Filter by category
    res_bev = client.get("/api/v1/menu?category=Beverages", auth=AUTH_ADMIN_1)
    assert len(res_bev.json()) == 1
    assert res_bev.json()[0]["name"] == "Tea"

    # Filter by availability
    res_avail = client.get("/api/v1/menu?is_available=true", auth=AUTH_ADMIN_1)
    assert len(res_avail.json()) == 1
    assert res_avail.json()[0]["name"] == "Tea"


def test_update_menu_item(client):
    res_create = client.post("/api/v1/menu", json={"name": "Mojito", "category": "Beverages", "price_single": 120.00}, auth=AUTH_ADMIN_1)
    item_id = res_create.json()["id"]

    patch_payload = {"price_single": 140.00, "is_available": False}
    res_patch = client.patch(f"/api/v1/menu/{item_id}", json=patch_payload, auth=AUTH_ADMIN_1)
    assert res_patch.status_code == 200
    data = res_patch.json()
    assert float(data["price_single"]) == 140.00
    assert data["is_available"] is False
