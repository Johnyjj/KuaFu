"""任务状态值对象"""

from dataclasses import dataclass
from enum import Enum
from typing import Any


class TaskStatus(Enum):
    """任务状态枚举"""
    TODO = "todo"          # 待办
    IN_PROGRESS = "in_progress"  # 进行中
    IN_REVIEW = "in_review"      # 待审核
    DONE = "done"          # 已完成
    BLOCKED = "blocked"    # 阻塞
    CANCELLED = "cancelled"  # 已取消


@dataclass(frozen=True)
class TaskStatusValue:
    """任务状态值对象"""
    status: TaskStatus

    def __post_init__(self) -> None:
        """验证任务状态"""
        if not isinstance(self.status, TaskStatus):
            raise ValueError(f"无效的任务状态: {self.status}")

    @classmethod
    def todo(cls) -> "TaskStatusValue":
        """创建待办状态"""
        return cls(status=TaskStatus.TODO)

    @classmethod
    def in_progress(cls) -> "TaskStatusValue":
        """创建进行中状态"""
        return cls(status=TaskStatus.IN_PROGRESS)

    @classmethod
    def in_review(cls) -> "TaskStatusValue":
        """创建待审核状态"""
        return cls(status=TaskStatus.IN_REVIEW)

    @classmethod
    def done(cls) -> "TaskStatusValue":
        """创建已完成状态"""
        return cls(status=TaskStatus.DONE)

    @classmethod
    def blocked(cls) -> "TaskStatusValue":
        """创建阻塞状态"""
        return cls(status=TaskStatus.BLOCKED)

    @classmethod
    def cancelled(cls) -> "TaskStatusValue":
        """创建已取消状态"""
        return cls(status=TaskStatus.CANCELLED)

    def __str__(self) -> str:
        return self.status.value

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, TaskStatusValue):
            return False
        return self.status == other.status

    def __hash__(self) -> int:
        return hash(self.status)

    def is_active(self) -> bool:
        """检查是否为活跃状态"""
        return self.status in [
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.IN_REVIEW,
            TaskStatus.BLOCKED,
        ]

    def can_transition_to(self, new_status: "TaskStatusValue") -> bool:
        """检查是否可以转换到新状态"""
        valid_transitions = {
            TaskStatus.TODO: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
            TaskStatus.IN_PROGRESS: [TaskStatus.IN_REVIEW, TaskStatus.BLOCKED, TaskStatus.CANCELLED],
            TaskStatus.IN_REVIEW: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
            TaskStatus.BLOCKED: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
            TaskStatus.DONE: [],  # 已完成状态不能转换
            TaskStatus.CANCELLED: [],  # 已取消状态不能转换
        }
        return new_status.status in valid_transitions.get(self.status, [])
