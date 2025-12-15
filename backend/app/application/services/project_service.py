"""项目应用服务"""

from typing import List, Optional, Dict, Any
from datetime import datetime

from ...domain.entities import Project, Task
from ...domain.value_objects import ProjectId, UserId
from ...domain.services import ProjectDomainService
from ...domain.repositories import ProjectRepositoryInterface, TaskRepositoryInterface
from ..dtos.project_dtos import (
    CreateProjectDTO,
    UpdateProjectDTO,
    ProjectResponseDTO,
    ProjectListDTO,
    ProjectHealthDTO,
    ProjectVelocityDTO,
)


class ProjectService:
    """项目应用服务"""

    def __init__(
        self,
        project_repo: ProjectRepositoryInterface,
        task_repo: TaskRepositoryInterface,
    ):
        self.project_repo = project_repo
        self.task_repo = task_repo
        self.project_domain_service = ProjectDomainService()

    async def create_project(
        self, dto: CreateProjectDTO
    ) -> ProjectResponseDTO:
        """创建项目"""
        # 检查用户权限
        owner_id = UserId.from_string(dto.owner_id)
        if not self.project_domain_service.can_user_create_project(owner_id):
            raise ValueError("用户没有权限创建项目")

        # 创建项目聚合
        project_id = ProjectId.generate()
        project = Project(
            project_id=project_id,
            name=dto.name,
            description=dto.description,
            owner_id=owner_id,
        )

        # 添加所有者到成员列表
        project.add_member(owner_id)

        # 保存项目
        saved_project = await self.project_repo.save(project)

        return self._to_response_dto(saved_project)

    async def get_project(
        self, project_id: str
    ) -> Optional[ProjectResponseDTO]:
        """获取项目"""
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(project_id)
        )
        if not project:
            return None

        return self._to_response_dto(project)

    async def update_project(
        self, project_id: str, dto: UpdateProjectDTO
    ) -> Optional[ProjectResponseDTO]:
        """更新项目"""
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(project_id)
        )
        if not project:
            raise ValueError("项目不存在")

        # 更新项目属性
        if dto.name:
            project.update_name(dto.name)
        if dto.description:
            project.update_description(dto.description)
        if dto.status:
            if dto.status == "active":
                project.activate()
            elif dto.status == "on_hold":
                project.put_on_hold()
            elif dto.status == "completed":
                project.complete()
            elif dto.status == "cancelled":
                project.cancel()

        saved_project = await self.project_repo.save(project)
        return self._to_response_dto(saved_project)

    async def delete_project(self, project_id: str) -> bool:
        """删除项目"""
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(project_id)
        )
        if not project:
            return False

        return await self.project_repo.delete(
            ProjectId.from_string(project_id)
        )

    async def list_projects(
        self, owner_id: Optional[str] = None, limit: int = 100
    ) -> ProjectListDTO:
        """获取项目列表"""
        if owner_id:
            projects = await self.project_repo.get_by_owner_id(
                UserId.from_string(owner_id)
            )
        else:
            projects = await self.project_repo.get_all(limit=limit)

        project_dtos = [self._to_response_dto(p) for p in projects]

        return ProjectListDTO(
            projects=project_dtos,
            total=len(project_dtos),
            page=1,
            per_page=limit,
        )

    async def add_member(
        self, project_id: str, user_id: str
    ) -> Optional[ProjectResponseDTO]:
        """添加项目成员"""
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(project_id)
        )
        if not project:
            raise ValueError("项目不存在")

        project.add_member(UserId.from_string(user_id))
        saved_project = await self.project_repo.save(project)

        return self._to_response_dto(saved_project)

    async def remove_member(
        self, project_id: str, user_id: str
    ) -> Optional[ProjectResponseDTO]:
        """移除项目成员"""
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(project_id)
        )
        if not project:
            raise ValueError("项目不存在")

        project.remove_member(UserId.from_string(user_id))
        saved_project = await self.project_repo.save(project)

        return self._to_response_dto(saved_project)

    async def get_project_health(
        self, project_id: str
    ) -> ProjectHealthDTO:
        """获取项目健康度"""
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(project_id)
        )
        if not project:
            raise ValueError("项目不存在")

        health_data = self.project_domain_service.get_project_health_score(
            project
        )
        suggestions = self.project_domain_service.suggest_project_improvements(
            project
        )

        return ProjectHealthDTO(
            score=health_data["score"],
            status=health_data["status"],
            details=health_data["details"],
            suggestions=suggestions,
        )

    async def get_project_velocity(
        self, project_id: str, days: int = 30
    ) -> ProjectVelocityDTO:
        """获取项目速度"""
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(project_id)
        )
        if not project:
            raise ValueError("项目不存在")

        velocity_data = self.project_domain_service.get_project_velocity(
            project, days
        )

        return ProjectVelocityDTO(
            velocity=velocity_data["velocity"],
            tasks_completed=velocity_data["tasks_completed"],
            period_days=velocity_data["period_days"],
            average_per_day=velocity_data["average_per_day"],
        )

    async def get_project_tasks(
        self, project_id: str
    ) -> List[Dict[str, Any]]:
        """获取项目任务"""
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(project_id)
        )
        if not project:
            raise ValueError("项目不存在")

        tasks = await self.task_repo.get_by_project_id(
            ProjectId.from_string(project_id)
        )

        return [
            {
                "task_id": str(task.task_id),
                "title": task.title,
                "status": task.status.status.value,
                "priority": task.priority.level.value,
                "assignee_id": str(task.assignee_id) if task.assignee_id else None,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "is_completed": task.is_completed(),
                "is_overdue": task.is_overdue(),
            }
            for task in tasks
        ]

    def _to_response_dto(self, project: Project) -> ProjectResponseDTO:
        """转换为响应DTO"""
        return ProjectResponseDTO(
            project_id=str(project.project_id),
            name=project.name,
            description=project.description,
            owner_id=str(project.owner_id),
            status=project.status,
            created_at=project.created_at,
            updated_at=project.updated_at,
            member_ids=[str(uid) for uid in project.member_ids],
            task_progress=project.get_task_progress(),
        )
