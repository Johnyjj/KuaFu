"""任务仓储接口"""

from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from ..entities import Task
from ..value_objects.task_id import TaskId
from ..value_objects.project_id import ProjectId
from ..value_objects.user_id import UserId
from ..value_objects.task_status import TaskStatus
from ..value_objects.priority import Priority


class TaskRepositoryInterface(ABC):
    """任务仓储接口"""

    @abstractmethod
    async def save(self, task: Task) -> Task:
        """保存任务"""
        pass

    @abstractmethod
    async def get_by_id(self, task_id: TaskId) -> Optional[Task]:
        """根据ID获取任务"""
        pass

    @abstractmethod
    async def get_by_project_id(
        self, project_id: ProjectId
    ) -> List[Task]:
        """根据项目ID获取任务列表"""
        pass

    @abstractmethod
    async def get_by_assignee_id(
        self, assignee_id: UserId
    ) -> List[Task]:
        """根据负责人ID获取任务列表"""
        pass

    @abstractmethod
    async def get_by_reporter_id(
        self, reporter_id: UserId
    ) -> List[Task]:
        """根据报告者ID获取任务列表"""
        pass

    @abstractmethod
    async def get_by_status(
        self, status: TaskStatus
    ) -> List[Task]:
        """根据状态获取任务列表"""
        pass

    @abstractmethod
    async def get_by_priority(
        self, priority: Priority
    ) -> List[Task]:
        """根据优先级获取任务列表"""
        pass

    @abstractmethod
    async def get_overdue_tasks(self) -> List[Task]:
        """获取逾期任务"""
        pass

    @abstractmethod
    async def get_tasks_by_date_range(
        self, start_date: datetime, end_date: datetime
    ) -> List[Task]:
        """根据日期范围获取任务"""
        pass

    @abstractmethod
    async def delete(self, task_id: TaskId) -> bool:
        """删除任务"""
        pass

    @abstractmethod
    async def exists(self, task_id: TaskId) -> bool:
        """检查任务是否存在"""
        pass

    @abstractmethod
    async def search(
        self, query: str, project_id: Optional[ProjectId] = None
    ) -> List[Task]:
        """搜索任务"""
        pass
