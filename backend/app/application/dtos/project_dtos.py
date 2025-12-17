"""项目相关DTOs"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator


class ProjectBaseDTO(BaseModel):
    """项目基础DTO"""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=2000)


class CreateProjectDTO(ProjectBaseDTO):
    """创建项目DTO"""
    owner_id: str


class UpdateProjectDTO(BaseModel):
    """更新项目DTO"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    status: Optional[str] = None


class ProjectResponseDTO(BaseModel):
    """项目响应DTO"""
    project_id: str
    name: str
    description: str
    owner_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    member_ids: List[str] = Field(default_factory=list)
    task_progress: dict = Field(default_factory=dict)

    class Config:
        from_attributes = True


class ProjectListDTO(BaseModel):
    """项目列表DTO"""
    projects: List[ProjectResponseDTO]
    total: int
    page: int
    per_page: int


class AddMemberDTO(BaseModel):
    """添加成员DTO"""
    user_id: str


class ProjectStatsDTO(BaseModel):
    """项目统计DTO"""
    total_projects: int
    active_projects: int
    completed_projects: int
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int


class ProjectHealthDTO(BaseModel):
    """项目健康度DTO"""
    score: float
    status: str
    details: dict
    suggestions: List[str]


class ProjectVelocityDTO(BaseModel):
    """项目速度DTO"""
    velocity: float
    tasks_completed: int
    period_days: int
    average_per_day: float


class ProjectBurndownDataDTO(BaseModel):
    """项目燃尽图数据DTO"""
    date: str
    remaining_tasks: int
