"""任务应用服务"""

from typing import List, Optional, Dict, Any
from datetime import datetime

from ...domain.entities import Task
from ...domain.value_objects import TaskId, ProjectId, UserId
from ...domain.services import TaskDomainService
from ...domain.repositories import TaskRepositoryInterface, ProjectRepositoryInterface, UserRepositoryInterface
from ..dtos.task_dtos import (
    CreateTaskDTO,
    UpdateTaskDTO,
    TaskResponseDTO,
    TaskListDTO,
    TaskFilterDTO,
)


class TaskService:
    """任务应用服务"""

    def __init__(
        self,
        task_repo: TaskRepositoryInterface,
        project_repo: ProjectRepositoryInterface,
        user_repo: UserRepositoryInterface,
    ):
        self.task_repo = task_repo
        self.project_repo = project_repo
        self.user_repo = user_repo
        self.task_domain_service = TaskDomainService()

    async def create_task(self, dto: CreateTaskDTO) -> TaskResponseDTO:
        """创建任务"""
        # 验证项目存在
        project = await self.project_repo.get_by_id(
            ProjectId.from_string(dto.project_id)
        )
        if not project:
            raise ValueError("项目不存在")

        # 创建任务聚合
        task_id = TaskId.generate()
        task = Task(
            task_id=task_id,
            project_id=ProjectId.from_string(dto.project_id),
            title=dto.title,
            description=dto.description,
            priority=self._parse_priority(dto.priority),
            assignee_id=UserId.from_string(dto.assignee_id) if dto.assignee_id else None,
            reporter_id=UserId.from_string(dto.reporter_id),
            due_date=dto.due_date,
            parent_task_id=TaskId.from_string(dto.parent_task_id) if dto.parent_task_id else None,
            tags=dto.tags or [],
        )

        # 添加到项目
        project.add_task(task)

        # 保存项目和任务
        await self.project_repo.save(project)
        saved_task = await self.task_repo.save(task)

        return self._to_response_dto(saved_task)

    async def get_task(self, task_id: str) -> Optional[TaskResponseDTO]:
        """获取任务"""
        task = await self.task_repo.get_by_id(TaskId.from_string(task_id))
        if not task:
            return None

        return self._to_response_dto(task)

    async def update_task(
        self, task_id: str, dto: UpdateTaskDTO
    ) -> Optional[TaskResponseDTO]:
        """更新任务"""
        task = await self.task_repo.get_by_id(TaskId.from_string(task_id))
        if not task:
            raise ValueError("任务不存在")

        # 更新任务属性
        if dto.title:
            task.update_title(dto.title)
        if dto.description:
            task.update_description(dto.description)
        if dto.priority:
            task.update_priority(self._parse_priority(dto.priority))
        if dto.status:
            task.change_status(self._parse_status(dto.status))
        if dto.assignee_id is not None:
            if dto.assignee_id:
                task.assign_to(UserId.from_string(dto.assignee_id))
            else:
                task.unassign()
        if dto.due_date is not None:
            task.set_due_date(dto.due_date)

        saved_task = await self.task_repo.save(task)
        return self._to_response_dto(saved_task)

    async def delete_task(self, task_id: str) -> bool:
        """删除任务"""
        return await self.task_repo.delete(TaskId.from_string(task_id))

    async def list_tasks(
        self, filters: Optional[TaskFilterDTO] = None
    ) -> TaskListDTO:
        """获取任务列表"""
        if filters:
            tasks = await self._filter_tasks(filters)
        else:
            tasks = await self.task_repo.get_all(limit=100)

        task_dtos = [self._to_response_dto(t) for t in tasks]

        return TaskListDTO(
            tasks=task_dtos,
            total=len(task_dtos),
            page=filters.page if filters else 1,
            per_page=filters.per_page if filters else 20,
        )

    async def _filter_tasks(self, filters: TaskFilterDTO) -> List[Task]:
        """筛选任务"""
        tasks = []

        if filters.project_id:
            tasks.extend(
                await self.task_repo.get_by_project_id(
                    ProjectId.from_string(filters.project_id)
                )
            )
        else:
            tasks = await self.task_repo.get_all(limit=100)

        # 应用其他筛选条件
        if filters.assignee_id:
            tasks = [
                t for t in tasks
                if t.assignee_id == UserId.from_string(filters.assignee_id)
            ]

        if filters.status:
            tasks = [
                t for t in tasks
                if t.status.status.value == filters.status
            ]

        if filters.priority:
            tasks = [
                t for t in tasks
                if t.priority.level.value == filters.priority
            ]

        if filters.overdue is not None:
            if filters.overdue:
                tasks = [t for t in tasks if t.is_overdue()]
            else:
                tasks = [t for t in tasks if not t.is_overdue()]

        return tasks

    def _parse_priority(self, priority: str):
        """解析优先级"""
        from ...domain.value_objects import Priority, PriorityLevel
        priority_map = {
            "low": Priority.low(),
            "medium": Priority.medium(),
            "high": Priority.high(),
            "urgent": Priority.urgent(),
        }
        return priority_map.get(priority, Priority.medium())

    def _parse_status(self, status: str):
        """解析状态"""
        from ...domain.value_objects import TaskStatusValue
        status_map = {
            "todo": TaskStatusValue.todo(),
            "in_progress": TaskStatusValue.in_progress(),
            "in_review": TaskStatusValue.in_review(),
            "done": TaskStatusValue.done(),
            "blocked": TaskStatusValue.blocked(),
            "cancelled": TaskStatusValue.cancelled(),
        }
        return status_map.get(status, TaskStatusValue.todo())

    def _to_response_dto(self, task: Task) -> TaskResponseDTO:
        """转换为响应DTO"""
        return TaskResponseDTO(
            task_id=str(task.task_id),
            project_id=str(task.project_id),
            title=task.title,
            description=task.description,
            status=task.status.status.value,
            priority=task.priority.level.value,
            assignee_id=str(task.assignee_id) if task.assignee_id else None,
            reporter_id=str(task.reporter_id),
            created_at=task.created_at,
            updated_at=task.updated_at,
            due_date=task.due_date,
            completed_at=task.completed_at,
            parent_task_id=str(task.parent_task_id) if task.parent_task_id else None,
            subtasks=[str(tid) for tid in task.subtasks],
            tags=task.tags,
            is_completed=task.is_completed(),
            is_overdue=task.is_overdue(),
        )
