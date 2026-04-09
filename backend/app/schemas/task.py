from __future__ import annotations
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from typing import Optional
from app.models.task import TaskStatus, TaskPriority


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assignee_id: Optional[UUID] = None
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[UUID] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    due_date: Optional[date] = None


class TaskLogCreate(BaseModel):
    content: str
    progress: int = Field(..., ge=0, le=100)
    status: TaskStatus


class AssigneeOut(BaseModel):
    id: UUID
    name: str
    model_config = {"from_attributes": True}


class TaskLogOut(BaseModel):
    id: UUID
    content: str
    progress: int
    status: str
    created_at: datetime
    user: AssigneeOut
    model_config = {"from_attributes": True}


class TaskOut(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    progress: int
    due_date: Optional[date]
    created_at: datetime
    updated_at: datetime
    assignee: Optional[AssigneeOut]
    model_config = {"from_attributes": True}
