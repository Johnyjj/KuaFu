"""项目实体"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Set
from .task import Task
from ..value_objects.project_id import ProjectId
from ..value_objects.user_id import UserId


class ProjectStatus:
    """项目状态枚举"""
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


@dataclass
class Project:
    """项目聚合根实体"""
    project_id: ProjectId
    name: str
    description: str
    owner_id: UserId
    status: str = field(default=ProjectStatus.PLANNING)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    tasks: List[Task] = field(default_factory=list)
    member_ids: Set[UserId] = field(default_factory=set)

    def __post_init__(self) -> None:
        """验证项目数据"""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("项目名称不能为空")
        if len(self.name) > 100:
            raise ValueError("项目名称长度不能超过100个字符")
        if not self.description:
            raise ValueError("项目描述不能为空")

    def update_name(self, new_name: str) -> None:
        """更新项目名称"""
        if not new_name or len(new_name.strip()) == 0:
            raise ValueError("项目名称不能为空")
        if len(new_name) > 100:
            raise ValueError("项目名称长度不能超过100个字符")
        self.name = new_name
        self.updated_at = datetime.utcnow()

    def update_description(self, new_description: str) -> None:
        """更新项目描述"""
        if not new_description:
            raise ValueError("项目描述不能为空")
        self.description = new_description
        self.updated_at = datetime.utcnow()

    def activate(self) -> None:
        """激活项目"""
        if self.status == ProjectStatus.CANCELLED:
            raise ValueError("已取消的项目不能重新激活")
        if self.status == ProjectStatus.COMPLETED:
            raise ValueError("已完成的项目不能重新激活")

        self.status = ProjectStatus.ACTIVE
        self.updated_at = datetime.utcnow()

    def put_on_hold(self) -> None:
        """暂停项目"""
        if self.status not in [ProjectStatus.ACTIVE, ProjectStatus.PLANNING]:
            raise ValueError("只有活跃或计划中的项目可以暂停")
        self.status = ProjectStatus.ON_HOLD
        self.updated_at = datetime.utcnow()

    def complete(self) -> None:
        """完成项目"""
        if self.status == ProjectStatus.CANCELLED:
            raise ValueError("已取消的项目不能完成")

        # 检查是否所有任务都已完成
        active_tasks = [task for task in self.tasks if not task.is_completed()]
        if active_tasks:
            raise ValueError(f"还有 {len(active_tasks)} 个未完成的任务，无法完成项目")

        self.status = ProjectStatus.COMPLETED
        self.updated_at = datetime.utcnow()

    def cancel(self) -> None:
        """取消项目"""
        if self.status == ProjectStatus.COMPLETED:
            raise ValueError("已完成的项目不能取消")
        self.status = ProjectStatus.CANCELLED
        self.updated_at = datetime.utcnow()

    def add_task(self, task: Task) -> None:
        """添加任务"""
        if self.status == ProjectStatus.CANCELLED:
            raise ValueError("已取消的项目不能添加任务")
        if self.status == ProjectStatus.COMPLETED:
            raise ValueError("已完成的项目不能添加任务")

        # 检查任务是否已存在
        if any(t.task_id == task.task_id for t in self.tasks):
            raise ValueError(f"任务 {task.task_id} 已存在于项目中")

        self.tasks.append(task)
        self.updated_at = datetime.utcnow()

    def remove_task(self, task_id: ProjectId) -> None:
        """移除任务"""
        self.tasks = [t for t in self.tasks if t.task_id != task_id]
        self.updated_at = datetime.utcnow()

    def add_member(self, user_id: UserId) -> None:
        """添加项目成员"""
        if user_id in self.member_ids:
            raise ValueError(f"用户 {user_id} 已经是项目成员")
        self.member_ids.add(user_id)
        self.updated_at = datetime.utcnow()

    def remove_member(self, user_id: UserId) -> None:
        """移除项目成员"""
        if user_id not in self.member_ids:
            raise ValueError(f"用户 {user_id} 不是项目成员")

        # 不能移除项目所有者
        if user_id == self.owner_id:
            raise ValueError("不能移除项目所有者")

        self.member_ids.discard(user_id)
        self.updated_at = datetime.utcnow()

    def is_member(self, user_id: UserId) -> bool:
        """检查用户是否为项目成员"""
        return user_id in self.member_ids or user_id == self.owner_id

    def get_active_tasks(self) -> List[Task]:
        """获取活跃任务"""
        return [task for task in self.tasks if not task.is_completed()]

    def get_completed_tasks(self) -> List[Task]:
        """获取已完成任务"""
        return [task for task in self.tasks if task.is_completed()]

    def get_task_progress(self) -> dict:
        """获取项目进度"""
        total_tasks = len(self.tasks)
        if total_tasks == 0:
            return {"total": 0, "completed": 0, "percentage": 0}

        completed_tasks = len(self.get_completed_tasks())
        percentage = (completed_tasks / total_tasks) * 100

        return {
            "total": total_tasks,
            "completed": completed_tasks,
            "percentage": round(percentage, 2),
        }

    def is_owner(self, user_id: UserId) -> bool:
        """检查用户是否为项目所有者"""
        return self.owner_id == user_id

    def can_edit(self, user_id: UserId) -> bool:
        """检查用户是否可以编辑项目"""
        return self.is_owner(user_id) or self.is_member(user_id)

    def __eq__(self, other) -> bool:
        if not isinstance(other, Project):
            return False
        return self.project_id == other.project_id

    def __hash__(self) -> int:
        return hash(self.project_id)
