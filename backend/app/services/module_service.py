from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID
from app.models.module import Module
from app.models.task import Task, TaskLog
from app.models.user import User, UserRole
from app.schemas.module import ModuleCreate, ModuleUpdate


def list_modules(db: Session, project_id: UUID) -> list[Module]:
    return (
        db.query(Module)
        .filter(Module.project_id == project_id)
        .order_by(Module.order, Module.created_at)
        .all()
    )


def get_module_or_404(db: Session, module_id: UUID) -> Module:
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


def create_module(db: Session, project_id: UUID, data: ModuleCreate) -> Module:
    module = Module(project_id=project_id, **data.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


def update_module(db: Session, module: Module, data: ModuleUpdate) -> Module:
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(module, k, v)
    db.commit()
    db.refresh(module)
    return module


def delete_module(db: Session, module: Module) -> None:
    # Cascade: delete all task logs then tasks belonging to this module
    task_ids = [t.id for t in db.query(Task.id).filter(Task.module_id == module.id).all()]
    if task_ids:
        db.query(TaskLog).filter(TaskLog.task_id.in_(task_ids)).delete(synchronize_session=False)
        db.query(Task).filter(Task.module_id == module.id).delete(synchronize_session=False)
    db.delete(module)
    db.commit()
