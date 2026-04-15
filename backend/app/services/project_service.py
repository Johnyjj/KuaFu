from sqlalchemy.orm import Session
from fastapi import HTTPException
from uuid import UUID
from app.models.project import Project, ProjectMember
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_accessible_projects(db: Session, user: User) -> list[Project]:
    if user.role == UserRole.admin:
        return db.query(Project).filter(Project.owner_id == user.id).all()
    return (db.query(Project)
              .join(ProjectMember, ProjectMember.project_id == Project.id)
              .filter(ProjectMember.user_id == user.id)
              .all())


def get_project_or_403(db: Session, project_id: UUID, user: User) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user.role == UserRole.admin:
        if project.owner_id != user.id:
            raise HTTPException(status_code=403, detail="Not your project")
    else:
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Access denied")
    return project


def create_project(db: Session, data: ProjectCreate, owner: User) -> Project:
    project = Project(name=data.name, description=data.description, owner_id=owner.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()


def update_project(db: Session, project: Project, data: ProjectUpdate) -> Project:
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(project, k, v)
    db.commit()
    db.refresh(project)
    return project


def add_member(db: Session, project: Project, user_id: UUID) -> None:
    if db.query(ProjectMember).filter_by(project_id=project.id, user_id=user_id).first():
        raise HTTPException(status_code=400, detail="Already a member")
    db.add(ProjectMember(project_id=project.id, user_id=user_id))
    db.commit()


def remove_member(db: Session, project: Project, user_id: UUID) -> None:
    m = db.query(ProjectMember).filter_by(project_id=project.id, user_id=user_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(m)
    db.commit()


def get_project_members(db: Session, project_id: UUID) -> list[User]:
    return (db.query(User)
              .join(ProjectMember, ProjectMember.user_id == User.id)
              .filter(ProjectMember.project_id == project_id)
              .all())


from app.models.task import Task, TaskStatus


def get_project_stats(db: Session, project_id: UUID) -> dict:
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    total = len(tasks)
    by_status = {s.value: 0 for s in TaskStatus}
    for t in tasks:
        by_status[t.status.value] += 1
    avg_progress = round(sum(t.progress for t in tasks) / total, 1) if total else 0

    member_stats = []
    members = get_project_members(db, project_id)
    for m in members:
        member_tasks = [t for t in tasks if t.assignee_id == m.id]
        member_stats.append({
            "user_id": str(m.id),
            "name": m.name,
            "total": len(member_tasks),
            "done": sum(1 for t in member_tasks if t.status == TaskStatus.done),
        })

    return {
        "total_tasks": total,
        "by_status": by_status,
        "avg_progress": avg_progress,
        "member_stats": member_stats,
    }
