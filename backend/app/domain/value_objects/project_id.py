"""项目ID值对象"""

from dataclasses import dataclass
from typing import Any
import uuid


@dataclass(frozen=True)
class ProjectId:
    """项目唯一标识符值对象"""
    value: str

    def __post_init__(self) -> None:
        """验证项目ID"""
        if not self.value:
            raise ValueError("项目ID不能为空")

        # 验证UUID格式
        try:
            uuid.UUID(self.value)
        except ValueError:
            raise ValueError(f"项目ID格式无效: {self.value}")

    @classmethod
    def generate(cls) -> "ProjectId":
        """生成新的项目ID"""
        return cls(value=str(uuid.uuid4()))

    @classmethod
    def from_string(cls, value: str) -> "ProjectId":
        """从字符串创建项目ID"""
        return cls(value=value)

    def __str__(self) -> str:
        return self.value

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, ProjectId):
            return False
        return self.value == other.value

    def __hash__(self) -> int:
        return hash(self.value)
