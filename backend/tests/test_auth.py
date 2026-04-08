def test_login_success(client, admin_user):
    res = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "admin123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"

def test_login_wrong_password(client, admin_user):
    res = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "wrong"})
    assert res.status_code == 401

def test_login_unknown_email(client):
    res = client.post("/api/v1/auth/login", json={"email": "x@x.com", "password": "x"})
    assert res.status_code == 401

def test_me_returns_current_user(client, admin_token):
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "admin@test.com"

def test_me_invalid_token(client):
    res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"})
    assert res.status_code == 401
