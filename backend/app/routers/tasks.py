from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskLogCreate, TaskLogOut
from app.services.task_service import (
    get_task_or_403, list_tasks, create_task, update_task, create_log, list_logs
)
from app.services.project_service import get_project_or_403

router = APIRouter()


@router.get("/projects/{project_id}/tasks", response_model=list[TaskOut])
def get_tasks(project_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_project_or_403(db, project_id, user)
    return list_tasks(db, project_id)


@router.post("/projects/{project_id}/tasks", response_model=TaskOut, status_code=201)
def create(project_id: UUID, body: TaskCreate, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    get_project_or_403(db, project_id, user)
    return create_task(db, project_id, body)


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update(task_id: UUID, body: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = get_task_or_403(db, task_id, user)
    return update_task(db, task, body, user)


@router.get("/tasks/{task_id}/logs", response_model=list[TaskLogOut])
def get_logs(task_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_task_or_403(db, task_id, user)
    return list_logs(db, task_id)


@router.post("/tasks/{task_id}/logs", response_model=TaskLogOut, status_code=201)
def add_log(task_id: UUID, body: TaskLogCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    task = get_task_or_403(db, task_id, user)
    return create_log(db, task, body, user)
