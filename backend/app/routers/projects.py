from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from io import BytesIO
from urllib.parse import quote
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut, MemberAdd
from app.schemas.user import UserOut
from app.services.project_service import (
    get_accessible_projects, get_project_or_403,
    create_project, update_project,
    add_member, remove_member, get_project_members,
    get_project_stats,
)
from app.services.export_service import generate_excel

router = APIRouter()


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_accessible_projects(db, user)


@router.post("", response_model=ProjectOut, status_code=201)
def create(body: ProjectCreate, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    return create_project(db, body, user)


@router.get("/{project_id}", response_model=ProjectOut)
def get(project_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_project_or_403(db, project_id, user)


@router.patch("/{project_id}", response_model=ProjectOut)
def update(project_id: UUID, body: ProjectUpdate, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    project = get_project_or_403(db, project_id, user)
    return update_project(db, project, body)


@router.get("/{project_id}/members", response_model=list[UserOut])
def list_members(project_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_project_or_403(db, project_id, user)
    return get_project_members(db, project_id)


@router.post("/{project_id}/members", status_code=201)
def add(project_id: UUID, body: MemberAdd, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    project = get_project_or_403(db, project_id, user)
    add_member(db, project, body.user_id)
    return {"message": "member added"}


@router.delete("/{project_id}/members/{user_id}", status_code=204)
def remove(project_id: UUID, user_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    project = get_project_or_403(db, project_id, user)
    remove_member(db, project, user_id)


@router.get("/{project_id}/stats")
def stats(project_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    get_project_or_403(db, project_id, user)
    return get_project_stats(db, project_id)


@router.get("/{project_id}/export")
def export(project_id: UUID, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    project = get_project_or_403(db, project_id, user)
    content = generate_excel(db, project)
    return StreamingResponse(
        BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(project.name)}-report.xlsx"}
    )
