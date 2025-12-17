"""用户相关DTOs"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, validator


class UserBaseDTO(BaseModel):
    """用户基础DTO"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)


class CreateUserDTO(UserBaseDTO):
    """创建用户DTO"""
    password: str = Field(..., min_length=8)


class UpdateUserDTO(BaseModel):
    """更新用户DTO"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None


class UserResponseDTO(BaseModel):
    """用户响应DTO"""
    user_id: str
    email: str
    username: str
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]
    avatar_url: Optional[str]
    bio: Optional[str]
    project_ids: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True


class UserLoginDTO(BaseModel):
    """用户登录DTO"""
    email: EmailStr
    password: str


class UserTokenDTO(BaseModel):
    """用户令牌DTO"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserProfileDTO(BaseModel):
    """用户档案DTO"""
    user_id: str
    email: str
    username: str
    full_name: str
    avatar_url: Optional[str]
    bio: Optional[str]
    display_name: str
    initials: str


class UserProductivityDTO(BaseModel):
    """用户生产力DTO"""
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    average_completion_time: float
    on_time_rate: float


class UserWorkloadDTO(BaseModel):
    """用户工作量DTO"""
    current_load: int
    estimated_hours: float
    upcoming_deadlines: List[dict]
    overdue_tasks: int


class UserActivityDTO(BaseModel):
    """用户活动DTO"""
    date: str
    type: str
    task_id: str
    task_title: str
    status: Optional[str] = None


class UserSuggestionDTO(BaseModel):
    """用户建议DTO"""
    suggestions: List[str]


class TeamPerformanceDTO(BaseModel):
    """团队绩效DTO"""
    total_members: int
    total_tasks: int
    completed_tasks: int
    overall_completion_rate: float
    workload_distribution: dict
    average_productivity: float
    overdue_tasks: int


class UserListDTO(BaseModel):
    """用户列表DTO"""
    users: List[UserResponseDTO]
    total: int
    page: int
    per_page: int


class ChangePasswordDTO(BaseModel):
    """修改密码DTO"""
    current_password: str
    new_password: str = Field(..., min_length=8)


class UserStatsDTO(BaseModel):
    """用户统计DTO"""
    total_users: int
    active_users: int
    new_users_this_month: int
