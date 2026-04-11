import pytest
from app.models.project import Project
from app.models.module import Module


@pytest.fixture
def project(db, admin_user):
    p = Project(name="P", owner_id=admin_user.id)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@pytest.fixture
def module_obj(db, project, admin_user):
    m = Module(project_id=project.id, name="后端开发", owner_id=admin_user.id)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


def test_admin_can_create_module(client, admin_token, project):
    res = client.post(
        f"/api/v1/projects/{project.id}/modules",
        json={"name": "前端", "description": "前端模块"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "前端"
    assert data["description"] == "前端模块"


def test_member_cannot_create_module(client, member_token, project):
    res = client.post(
        f"/api/v1/projects/{project.id}/modules",
        json={"name": "X"},
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert res.status_code == 403


def test_list_modules(client, admin_token, project, module_obj):
    res = client.get(
        f"/api/v1/projects/{project.id}/modules",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["name"] == "后端开发"


def test_admin_can_update_module(client, admin_token, module_obj):
    res = client.patch(
        f"/api/v1/modules/{module_obj.id}",
        json={"name": "后端重构"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert res.json()["name"] == "后端重构"


def test_member_cannot_update_non_owned_module(client, member_token, module_obj):
    res = client.patch(
        f"/api/v1/modules/{module_obj.id}",
        json={"name": "X"},
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert res.status_code == 403


def test_admin_can_delete_module(client, admin_token, module_obj):
    res = client.delete(
        f"/api/v1/modules/{module_obj.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 204


def test_delete_module_nullifies_task_module_id(client, admin_token, project, module_obj, db):
    from app.models.task import Task
    task = Task(project_id=project.id, title="T", module_id=module_obj.id)
    db.add(task)
    db.commit()

    client.delete(
        f"/api/v1/modules/{module_obj.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    db.expire_all()
    task_after = db.query(Task).filter(Task.id == task.id).first()
    assert task_after.module_id is None
