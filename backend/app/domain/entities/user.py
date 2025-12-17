"""用户实体"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Set
from ..value_objects.user_id import UserId


@dataclass
class User:
    """用户聚合根实体"""
    user_id: UserId
    email: str
    username: str
    full_name: str
    hashed_password: str
    is_active: bool = field(default=True)
    is_superuser: bool = field(default=False)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    project_ids: Set[str] = field(default_factory=set)  # 参与的项目ID集合

    def __post_init__(self) -> None:
        """验证用户数据"""
        if not self.email or "@" not in self.email:
            raise ValueError("邮箱格式无效")
        if not self.username or len(self.username.strip()) == 0:
            raise ValueError("用户名不能为空")
        if not self.full_name or len(self.full_name.strip()) == 0:
            raise ValueError("全名不能为空")
        if len(self.email) > 255:
            raise ValueError("邮箱长度不能超过255个字符")
        if len(self.username) > 50:
            raise ValueError("用户名长度不能超过50个字符")
        if len(self.full_name) > 100:
            raise ValueError("全名长度不能超过100个字符")
        if self.bio and len(self.bio) > 500:
            raise ValueError("个人简介长度不能超过500个字符")

    def update_email(self, new_email: str) -> None:
        """更新邮箱"""
        if not new_email or "@" not in new_email:
            raise ValueError("邮箱格式无效")
        if len(new_email) > 255:
            raise ValueError("邮箱长度不能超过255个字符")
        self.email = new_email
        self.updated_at = datetime.utcnow()

    def update_username(self, new_username: str) -> None:
        """更新用户名"""
        if not new_username or len(new_username.strip()) == 0:
            raise ValueError("用户名不能为空")
        if len(new_username) > 50:
            raise ValueError("用户名长度不能超过50个字符")
        self.username = new_username
        self.updated_at = datetime.utcnow()

    def update_full_name(self, new_full_name: str) -> None:
        """更新全名"""
        if not new_full_name or len(new_full_name.strip()) == 0:
            raise ValueError("全名不能为空")
        if len(new_full_name) > 100:
            raise ValueError("全名长度不能超过100个字符")
        self.full_name = new_full_name
        self.updated_at = datetime.utcnow()

    def update_password(self, hashed_password: str) -> None:
        """更新密码"""
        if not hashed_password:
            raise ValueError("密码不能为空")
        self.hashed_password = hashed_password
        self.updated_at = datetime.utcnow()

    def update_avatar(self, avatar_url: Optional[str]) -> None:
        """更新头像"""
        self.avatar_url = avatar_url
        self.updated_at = datetime.utcnow()

    def update_bio(self, bio: Optional[str]) -> None:
        """更新个人简介"""
        if bio and len(bio) > 500:
            raise ValueError("个人简介长度不能超过500个字符")
        self.bio = bio
        self.updated_at = datetime.utcnow()

    def activate(self) -> None:
        """激活用户"""
        self.is_active = True
        self.updated_at = datetime.utcnow()

    def deactivate(self) -> None:
        """停用用户"""
        self.is_active = False
        self.updated_at = datetime.utcnow()

    def grant_superuser(self) -> None:
        """授予超级用户权限"""
        self.is_superuser = True
        self.updated_at = datetime.utcnow()

    def revoke_superuser(self) -> None:
        """撤销超级用户权限"""
        self.is_superuser = False
        self.updated_at = datetime.utcnow()

    def update_last_login(self) -> None:
        """更新最后登录时间"""
        self.last_login = datetime.utcnow()

    def add_project(self, project_id: str) -> None:
        """添加参与的项目"""
        if project_id in self.project_ids:
            raise ValueError(f"用户已参与项目 {project_id}")
        self.project_ids.add(project_id)
        self.updated_at = datetime.utcnow()

    def remove_project(self, project_id: str) -> None:
        """移除参与的项目"""
        if project_id in self.project_ids:
            self.project_ids.discard(project_id)
            self.updated_at = datetime.utcnow()

    def is_participating_in_project(self, project_id: str) -> bool:
        """检查用户是否参与指定项目"""
        return project_id in self.project_ids

    def can_access_project(self, project_id: str) -> bool:
        """检查用户是否可以访问项目"""
        return self.is_superuser or self.is_participating_in_project(project_id)

    def has_permission(self, permission: str) -> bool:
        """检查用户是否具有特定权限"""
        if self.is_superuser:
            return True
        # TODO: 实现基于角色的权限检查
        # 这里可以根据需要实现更复杂的权限系统
        return False

    def get_display_name(self) -> str:
        """获取显示名称"""
        if self.full_name:
            return self.full_name
        return self.username

    def get_initials(self) -> str:
        """获取姓名首字母"""
        name = self.get_display_name()
        if not name:
            return "U"
        parts = name.split()
        if len(parts) == 1:
            return parts[0][:2].upper()
        return (parts[0][0] + parts[1][0]).upper()

    def __eq__(self, other) -> bool:
        if not isinstance(other, User):
            return False
        return self.user_id == other.user_id

    def __hash__(self) -> int:
        return hash(self.user_id)

    def __str__(self) -> str:
        return f"User({self.user_id}, {self.username}, {self.email})"
