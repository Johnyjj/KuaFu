"""依赖注入配置"""

from typing import AsyncGenerator
from fastapi import Depends
from .infrastructure.database.repositories.project_repository_impl import (
    ProjectRepositoryImpl,
)
from .infrastructure.database.repositories.task_repository_impl import (
    TaskRepositoryImpl,
)
from .infrastructure.database.repositories.user_repository_impl import (
    UserRepositoryImpl,
)
from .application.services.project_service import ProjectService
from .application.services.task_service import TaskService
from .application.services.user_service import UserService


# 仓储依赖
async def get_project_repository() -> AsyncGenerator:
    """获取项目仓储实例"""
    repository = ProjectRepositoryImpl()
    yield repository


async def get_task_repository() -> AsyncGenerator:
    """获取任务仓储实例"""
    repository = TaskRepositoryImpl()
    yield repository


async def get_user_repository() -> AsyncGenerator:
    """获取用户仓储实例"""
    repository = UserRepositoryImpl()
    yield repository


# 服务依赖
async def get_project_service(
    project_repo=Depends(get_project_repository),
    task_repo=Depends(get_task_repository),
) -> ProjectService:
    """获取项目服务实例"""
    return ProjectService(project_repo, task_repo)


async def get_task_service(
    task_repo=Depends(get_task_repository),
    project_repo=Depends(get_project_repository),
    user_repo=Depends(get_user_repository),
) -> TaskService:
    """获取任务服务实例"""
    return TaskService(task_repo, project_repo, user_repo)


async def get_user_service(
    user_repo=Depends(get_user_repository),
) -> UserService:
    """获取用户服务实例"""
    return UserService(user_repo)
