def test_admin_can_create_user(client, admin_token):
    res = client.post("/api/v1/users",
        json={"name": "New Dev", "email": "new@test.com", "password": "pass123", "role": "member"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 201
    assert res.json()["email"] == "new@test.com"


def test_member_cannot_create_user(client, member_token):
    res = client.post("/api/v1/users",
        json={"name": "X", "email": "x@test.com", "password": "x", "role": "member"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 403


def test_admin_can_list_users(client, admin_token, admin_user, member_user):
    res = client.get("/api/v1/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_duplicate_email_rejected(client, admin_token, admin_user):
    res = client.post("/api/v1/users",
        json={"name": "Dup", "email": "admin@test.com", "password": "x", "role": "member"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 400
