import pytest


def test_unauthenticated_access(client):
    response = client.get("/api/v1/menu")
    assert response.status_code == 401


def test_invalid_credentials_access(client):
    response = client.get("/api/v1/menu", auth=("wrong_user", "wrong_pass"))
    assert response.status_code == 401


def test_admin_1_authentication(client):
    response = client.get("/api/v1/menu", auth=("i", "admin1pass"))
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_admin_2_authentication(client):
    response = client.get("/api/v1/menu", auth=("a", "admin2pass"))
    assert response.status_code == 200
    assert isinstance(response.json(), list)
