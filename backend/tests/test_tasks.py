import pytest
from app.models.project import Project, ProjectMember
from app.models.task import Task


@pytest.fixture
def project(db, admin_user):
    p = Project(name="P", owner_id=admin_user.id)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@pytest.fixture
def member_in_project(db, project, member_user):
    db.add(ProjectMember(project_id=project.id, user_id=member_user.id))
    db.commit()
    return member_user


@pytest.fixture
def task(db, project, member_user):
    t = Task(project_id=project.id, title="T1", assignee_id=member_user.id)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


def test_admin_creates_task(client, admin_token, project, member_user):
    res = client.post(f"/api/v1/projects/{project.id}/tasks",
        json={"title": "Task A", "assignee_id": str(member_user.id)},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 201


def test_member_cannot_create_task(client, member_token, project, member_in_project):
    res = client.post(f"/api/v1/projects/{project.id}/tasks",
        json={"title": "X"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 403


def test_member_can_add_log_to_own_task(client, member_token, project, task, member_in_project):
    res = client.post(f"/api/v1/tasks/{task.id}/logs",
        json={"content": "完成路由", "progress": 40, "status": "in_progress"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 201
    assert res.json()["progress"] == 40


def test_logs_history(client, member_token, project, task, member_in_project):
    client.post(f"/api/v1/tasks/{task.id}/logs",
        json={"content": "day1", "progress": 20, "status": "in_progress"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    client.post(f"/api/v1/tasks/{task.id}/logs",
        json={"content": "day2", "progress": 50, "status": "in_progress"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    res = client.get(f"/api/v1/tasks/{task.id}/logs",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 200
    assert len(res.json()) == 2
    assert res.json()[0]["progress"] == 50  # 最新在前
