"""项目仓储接口"""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities import Project
from ..value_objects.project_id import ProjectId
from ..value_objects.user_id import UserId


class ProjectRepositoryInterface(ABC):
    """项目仓储接口"""

    @abstractmethod
    async def save(self, project: Project) -> Project:
        """保存项目"""
        pass

    @abstractmethod
    async def get_by_id(self, project_id: ProjectId) -> Optional[Project]:
        """根据ID获取项目"""
        pass

    @abstractmethod
    async def get_by_owner_id(self, owner_id: UserId) -> List[Project]:
        """根据所有者ID获取项目列表"""
        pass

    @abstractmethod
    async def get_by_member_id(self, member_id: UserId) -> List[Project]:
        """根据成员ID获取项目列表"""
        pass

    @abstractmethod
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Project]:
        """获取所有项目"""
        pass

    @abstractmethod
    async def delete(self, project_id: ProjectId) -> bool:
        """删除项目"""
        pass

    @abstractmethod
    async def exists(self, project_id: ProjectId) -> bool:
        """检查项目是否存在"""
        pass

    @abstractmethod
    async def search(self, query: str) -> List[Project]:
        """搜索项目"""
        pass
