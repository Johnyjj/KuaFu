from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID
from app.models.task import Task, TaskLog
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskUpdate, TaskLogCreate
from app.services.project_service import get_project_or_403


def get_task_or_403(db: Session, task_id: UUID, user: User) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    get_project_or_403(db, task.project_id, user)
    return task


def list_tasks(db: Session, project_id: UUID) -> list:
    return db.query(Task).filter(Task.project_id == project_id).all()


def create_task(db: Session, project_id: UUID, data: TaskCreate) -> Task:
    task = Task(project_id=project_id, **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, data: TaskUpdate, user: User) -> Task:
    if user.role == UserRole.member and task.assignee_id != user.id:
        raise HTTPException(status_code=403, detail="Can only update your own tasks")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


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
