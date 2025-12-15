"""任务相关DTOs"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator


class TaskBaseDTO(BaseModel):
    """任务基础DTO"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    priority: str = Field(default="medium")
    due_date: Optional[datetime] = None


class CreateTaskDTO(TaskBaseDTO):
    """创建任务DTO"""
    project_id: str
    assignee_id: Optional[str] = None
    parent_task_id: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class UpdateTaskDTO(BaseModel):
    """更新任务DTO"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    priority: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskResponseDTO(BaseModel):
    """任务响应DTO"""
    task_id: str
    project_id: str
    title: str
    description: str
    status: str
    priority: str
    assignee_id: Optional[str]
    reporter_id: str
    created_at: datetime
    updated_at: datetime
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    parent_task_id: Optional[str]
    subtasks: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    is_completed: bool = False
    is_overdue: bool = False

    class Config:
        from_attributes = True


class TaskListDTO(BaseModel):
    """任务列表DTO"""
    tasks: List[TaskResponseDTO]
    total: int
    page: int
    per_page: int


class TaskFilterDTO(BaseModel):
    """任务筛选DTO"""
    project_id: Optional[str] = None
    assignee_id: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    overdue: Optional[bool] = None
    page: int = 1
    per_page: int = 20


class TaskComplexityDTO(BaseModel):
    """任务复杂度DTO"""
    score: int
    description: str


class TaskRiskDTO(BaseModel):
    """任务风险DTO"""
    risk_level: str
    risk_score: int
    risk_factors: List[str]
    suggestions: List[str]


class TaskEffortDTO(BaseModel):
    """任务工作量DTO"""
    estimated_hours: float
    complexity_score: int


class TaskSuggestionDTO(BaseModel):
    """任务建议DTO"""
    suggestions: List[str]


class WorkloadDistributionDTO(BaseModel):
    """工作量分布DTO"""
    total_tasks: int
    status_distribution: dict
    priority_distribution: dict
    overdue_count: int
    estimated_hours: float


class TaskBottleneckDTO(BaseModel):
    """任务瓶颈DTO"""
    task_id: str
    title: str
    issue: str
    age_days: Optional[int] = None
    suggestion: str
