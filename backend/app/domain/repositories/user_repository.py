"""用户仓储接口"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities import User
from ..value_objects.user_id import UserId


class UserRepositoryInterface(ABC):
    """用户仓储接口"""

    @abstractmethod
    async def save(self, user: User) -> User:
        """保存用户"""
        pass

    @abstractmethod
    async def get_by_id(self, user_id: UserId) -> Optional[User]:
        """根据ID获取用户"""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        pass

    @abstractmethod
    async def get_all(
        self, limit: int = 100, offset: int = 0
    ) -> List[User]:
        """获取所有用户"""
        pass

    @abstractmethod
    async def get_active_users(self) -> List[User]:
        """获取活跃用户"""
        pass

    @abstractmethod
    async def delete(self, user_id: UserId) -> bool:
        """删除用户"""
        pass

    @abstractmethod
    async def exists(self, user_id: UserId) -> bool:
        """检查用户是否存在"""
        pass

    @abstractmethod
    async def email_exists(self, email: str) -> bool:
        """检查邮箱是否存在"""
        pass

    @abstractmethod
    async def username_exists(self, username: str) -> bool:
        """检查用户名是否存在"""
        pass

    @abstractmethod
    async def search(self, query: str) -> List[User]:
        """搜索用户"""
        pass
