"""优先级值对象"""

from dataclasses import dataclass
from enum import Enum
from typing import Any


class PriorityLevel(Enum):
    """优先级级别枚举"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


@dataclass(frozen=True)
class Priority:
    """优先级值对象"""
    level: PriorityLevel

    def __post_init__(self) -> None:
        """验证优先级"""
        if not isinstance(self.level, PriorityLevel):
            raise ValueError(f"无效的优先级级别: {self.level}")

    @classmethod
    def low(cls) -> "Priority":
        """创建低优先级"""
        return cls(level=PriorityLevel.LOW)

    @classmethod
    def medium(cls) -> "Priority":
        """创建中等优先级"""
        return cls(level=PriorityLevel.MEDIUM)

    @classmethod
    def high(cls) -> "Priority":
        """创建高优先级"""
        return cls(level=PriorityLevel.HIGH)

    @classmethod
    def urgent(cls) -> "Priority":
        """创建紧急优先级"""
        return cls(level=PriorityLevel.URGENT)

    def __str__(self) -> str:
        return self.level.value

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, Priority):
            return False
        return self.level == other.level

    def __hash__(self) -> int:
        return hash(self.level)

    def __lt__(self, other: "Priority") -> bool:
        """比较优先级，用于排序"""
        order = {
            PriorityLevel.LOW: 1,
            PriorityLevel.MEDIUM: 2,
            PriorityLevel.HIGH: 3,
            PriorityLevel.URGENT: 4,
        }
        return order[self.level] < order[other.level]
