from __future__ import annotations
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class ModuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    owner_id: Optional[UUID] = None
    order: int = 0


class ModuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[UUID] = None
    order: Optional[int] = None


class ModuleOwnerOut(BaseModel):
    id: UUID
    name: str
    model_config = {"from_attributes": True}


class ModuleOut(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    description: Optional[str]
    owner: Optional[ModuleOwnerOut]
    order: int
    created_at: datetime
    model_config = {"from_attributes": True}
