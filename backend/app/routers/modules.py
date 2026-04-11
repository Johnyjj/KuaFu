from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleOut
from app.services.module_service import list_modules, get_module_or_404, create_module, update_module, delete_module
from app.services.project_service import get_project_or_403

router = APIRouter()


@router.get("/projects/{project_id}/modules", response_model=list[ModuleOut])
def get_modules(project_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_project_or_403(db, project_id, user)
    return list_modules(db, project_id)


@router.post("/projects/{project_id}/modules", response_model=ModuleOut, status_code=201)
def create(project_id: UUID, body: ModuleCreate, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    get_project_or_403(db, project_id, user)
    return create_module(db, project_id, body)


@router.patch("/modules/{module_id}", response_model=ModuleOut)
def update(module_id: UUID, body: ModuleUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    module = get_module_or_404(db, module_id)
    return update_module(db, module, body, user)


@router.delete("/modules/{module_id}", status_code=204)
def delete(module_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    module = get_module_or_404(db, module_id)
    delete_module(db, module)
