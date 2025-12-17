"""任务实体"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
from ..value_objects.task_id import TaskId
from ..value_objects.project_id import ProjectId
from ..value_objects.user_id import UserId
from ..value_objects.priority import Priority, PriorityLevel
from ..value_objects.task_status import TaskStatusValue, TaskStatus


@dataclass
class Task:
    """任务实体"""
    task_id: TaskId
    project_id: ProjectId
    title: str
    description: str
    status: TaskStatusValue = field(default_factory=TaskStatusValue.todo)
    priority: Priority = field(default_factory=Priority.medium)
    assignee_id: Optional[UserId] = None
    reporter_id: UserId
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    parent_task_id: Optional[TaskId] = None  # 父任务ID，用于子任务
    subtasks: List[TaskId] = field(default_factory=list)  # 子任务ID列表
    tags: List[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        """验证任务数据"""
        if not self.title or len(self.title.strip()) == 0:
            raise ValueError("任务标题不能为空")
        if len(self.title) > 200:
            raise ValueError("任务标题长度不能超过200个字符")
        if len(self.description) > 2000:
            raise ValueError("任务描述长度不能超过2000个字符")

    def update_title(self, new_title: str) -> None:
        """更新任务标题"""
        if not new_title or len(new_title.strip()) == 0:
            raise ValueError("任务标题不能为空")
        if len(new_title) > 200:
            raise ValueError("任务标题长度不能超过200个字符")
        self.title = new_title
        self.updated_at = datetime.utcnow()

    def update_description(self, new_description: str) -> None:
        """更新任务描述"""
        if len(new_description) > 2000:
            raise ValueError("任务描述长度不能超过2000个字符")
        self.description = new_description
        self.updated_at = datetime.utcnow()

    def update_priority(self, new_priority: Priority) -> None:
        """更新任务优先级"""
        self.priority = new_priority
        self.updated_at = datetime.utcnow()

    def assign_to(self, user_id: UserId) -> None:
        """分配任务给用户"""
        self.assignee_id = user_id
        self.updated_at = datetime.utcnow()

    def unassign(self) -> None:
        """取消分配"""
        self.assignee_id = None
        self.updated_at = datetime.utcnow()

    def change_status(self, new_status: TaskStatusValue) -> None:
        """更改任务状态"""
        if not self.status.can_transition_to(new_status):
            raise ValueError(
                f"不能从状态 {self.status} 转换到 {new_status}"
            )

        old_status = self.status
        self.status = new_status
        self.updated_at = datetime.utcnow()

        # 如果转换为已完成状态，记录完成时间
        if new_status.status == TaskStatus.DONE and old_status.status != TaskStatus.DONE:
            self.completed_at = datetime.utcnow()
        elif new_status.status != TaskStatus.DONE:
            self.completed_at = None

    def mark_as_todo(self) -> None:
        """标记为待办"""
        self.change_status(TaskStatusValue.todo())

    def mark_in_progress(self) -> None:
        """标记为进行中"""
        self.change_status(TaskStatusValue.in_progress())

    def mark_in_review(self) -> None:
        """标记为待审核"""
        self.change_status(TaskStatusValue.in_review())

    def mark_as_done(self) -> None:
        """标记为已完成"""
        self.change_status(TaskStatusValue.done())

    def mark_as_blocked(self) -> None:
        """标记为阻塞"""
        self.change_status(TaskStatusValue.blocked())

    def mark_as_cancelled(self) -> None:
        """标记为已取消"""
        self.change_status(TaskStatusValue.cancelled())

    def set_due_date(self, due_date: Optional[datetime]) -> None:
        """设置截止日期"""
        if due_date and due_date < datetime.utcnow():
            raise ValueError("截止日期不能是过去时间")
        self.due_date = due_date
        self.updated_at = datetime.utcnow()

    def add_subtask(self, subtask_id: TaskId) -> None:
        """添加子任务"""
        if subtask_id in self.subtasks:
            raise ValueError(f"子任务 {subtask_id} 已存在")
        self.subtasks.append(subtask_id)
        self.updated_at = datetime.utcnow()

    def remove_subtask(self, subtask_id: TaskId) -> None:
        """移除子任务"""
        if subtask_id in self.subtasks:
            self.subtasks.remove(subtask_id)
            self.updated_at = datetime.utcnow()

    def add_tag(self, tag: str) -> None:
        """添加标签"""
        tag = tag.strip().lower()
        if not tag:
            raise ValueError("标签不能为空")
        if tag in self.tags:
            raise ValueError(f"标签 '{tag}' 已存在")
        self.tags.append(tag)
        self.updated_at = datetime.utcnow()

    def remove_tag(self, tag: str) -> None:
        """移除标签"""
        tag = tag.strip().lower()
        if tag in self.tags:
            self.tags.remove(tag)
            self.updated_at = datetime.utcnow()

    def is_completed(self) -> bool:
        """检查任务是否已完成"""
        return self.status.status == TaskStatus.DONE

    def is_active(self) -> bool:
        """检查任务是否为活跃状态"""
        return self.status.is_active()

    def is_overdue(self) -> bool:
        """检查任务是否逾期"""
        if not self.due_date:
            return False
        return not self.is_completed() and datetime.utcnow() > self.due_date

    def get_age_in_days(self) -> int:
        """获取任务创建以来的天数"""
        delta = datetime.utcnow() - self.created_at
        return delta.days

    def is_high_priority(self) -> bool:
        """检查是否为高优先级"""
        return self.priority.level in [PriorityLevel.HIGH, PriorityLevel.URGENT]

    def can_be_edited_by(self, user_id: UserId) -> bool:
        """检查用户是否可以编辑任务"""
        # 任务分配者、任务负责人、项目所有者都可以编辑
        return self.reporter_id == user_id or self.assignee_id == user_id

    def __eq__(self, other) -> bool:
        if not isinstance(other, Task):
            return False
        return self.task_id == other.task_id

    def __hash__(self) -> int:
        return hash(self.task_id)

    def __str__(self) -> str:
        return f"Task({self.task_id}, {self.title}, {self.status})"
