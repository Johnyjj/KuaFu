import pytest
from app.models.project import Project


@pytest.fixture
def project(db, admin_user):
    p = Project(name="Test Project", owner_id=admin_user.id)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def test_admin_can_create_project(client, admin_token):
    res = client.post("/api/v1/projects",
        json={"name": "Alpha", "description": "desc"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 201
    assert res.json()["name"] == "Alpha"


def test_member_cannot_create_project(client, member_token):
    res = client.post("/api/v1/projects",
        json={"name": "X"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 403


def test_member_cannot_see_unassigned_project(client, member_token, project):
    res = client.get(f"/api/v1/projects/{project.id}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 403


def test_member_can_see_assigned_project(client, member_token, member_user, project, db, admin_token):
    client.post(f"/api/v1/projects/{project.id}/members",
        json={"user_id": str(member_user.id)},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    res = client.get(f"/api/v1/projects/{project.id}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 200


def test_admin_list_only_own_projects(client, admin_token, project):
    res = client.get("/api/v1/projects",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    assert len(res.json()) == 1
