"""用户ID值对象"""

from dataclasses import dataclass
from typing import Any
import uuid


@dataclass(frozen=True)
class UserId:
    """用户唯一标识符值对象"""
    value: str

    def __post_init__(self) -> None:
        """验证用户ID"""
        if not self.value:
            raise ValueError("用户ID不能为空")

        try:
            uuid.UUID(self.value)
        except ValueError:
            raise ValueError(f"用户ID格式无效: {self.value}")

    @classmethod
    def generate(cls) -> "UserId":
        """生成新的用户ID"""
        return cls(value=str(uuid.uuid4()))

    @classmethod
    def from_string(cls, value: str) -> "UserId":
        """从字符串创建用户ID"""
        return cls(value=value)

    def __str__(self) -> str:
        return self.value

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, UserId):
            return False
        return self.value == other.value

    def __hash__(self) -> int:
        return hash(self.value)
