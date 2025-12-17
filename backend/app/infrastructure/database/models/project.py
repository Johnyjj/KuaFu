"""项目ORM模型"""

from sqlalchemy import Column, String, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..base import Base


class ProjectModel(Base):
    """项目ORM模型"""
    __tablename__ = "projects"

    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    owner_id = Column(UUID(as_uuid=True), nullable=False)
    status = Column(String(50), nullable=False, default="planning")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    tasks = relationship("TaskModel", back_populates="project", cascade="all, delete-orphan")
