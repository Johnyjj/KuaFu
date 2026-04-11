from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID
from app.models.module import Module
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


def update_module(db: Session, module: Module, data: ModuleUpdate, user: User) -> Module:
    if user.role != UserRole.admin and module.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this module")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(module, k, v)
    db.commit()
    db.refresh(module)
    return module


def delete_module(db: Session, module: Module) -> None:
    from app.models.task import Task
    db.query(Task).filter(Task.module_id == module.id).update({"module_id": None})
    db.delete(module)
    db.commit()
