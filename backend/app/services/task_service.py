from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID
from typing import Optional
from app.models.task import Task, TaskLog
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskUpdate, TaskLogCreate
from app.services.project_service import get_project_or_403


def _check_module_permission(db: Session, user: User, module_id: Optional[UUID]) -> None:
    """Allow admin unconditionally; allow member only if they own the module."""
    if user.role == UserRole.admin:
        return
    if module_id is None:
        raise HTTPException(status_code=403, detail="Not authorized")
    from app.models.module import Module
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module or module.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized: not module owner")


def get_task_or_403(db: Session, task_id: UUID, user: User) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    get_project_or_403(db, task.project_id, user)
    return task


def list_tasks(db: Session, project_id: UUID) -> list:
    return db.query(Task).filter(Task.project_id == project_id).all()


def create_task(db: Session, project_id: UUID, data: TaskCreate, user: User) -> Task:
    _check_module_permission(db, user, data.module_id)
    task = Task(project_id=project_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, data: TaskUpdate, user: User) -> Task:
    _check_module_permission(db, user, task.module_id)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task, user: User) -> None:
    _check_module_permission(db, user, task.module_id)
    db.delete(task)
    db.commit()


def create_log(db: Session, task: Task, data: TaskLogCreate, user: User) -> TaskLog:
    if user.role == UserRole.member and task.assignee_id != user.id:
        raise HTTPException(status_code=403, detail="Can only log on your own tasks")
    log = TaskLog(task_id=task.id, user_id=user.id,
                  content=data.content, progress=data.progress, status=data.status.value)
    task.progress = data.progress
    task.status = data.status
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def list_logs(db: Session, task_id: UUID) -> list:
    return (db.query(TaskLog)
              .filter(TaskLog.task_id == task_id)
              .order_by(TaskLog.created_at.desc())
              .all())
