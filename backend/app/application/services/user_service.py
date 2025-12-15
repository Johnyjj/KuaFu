"""用户应用服务"""

from typing import List, Optional, Dict, Any
from datetime import datetime

from ...domain.entities import User
from ...domain.value_objects import UserId
from ...domain.repositories import UserRepositoryInterface
from ..dtos.user_dtos import (
    CreateUserDTO,
    UpdateUserDTO,
    UserResponseDTO,
    UserListDTO,
)


class UserService:
    """用户应用服务"""

    def __init__(self, user_repo: UserRepositoryInterface):
        self.user_repo = user_repo

    async def create_user(self, dto: CreateUserDTO) -> UserResponseDTO:
        """创建用户"""
        # 检查邮箱和用户名是否已存在
        if await self.user_repo.email_exists(dto.email):
            raise ValueError("邮箱已被使用")
        if await self.user_repo.username_exists(dto.username):
            raise ValueError("用户名已被使用")

        # 创建用户聚合
        user_id = UserId.generate()
        user = User(
            user_id=user_id,
            email=dto.email,
            username=dto.username,
            full_name=dto.full_name,
            hashed_password=dto.password,  # 实际项目中需要加密
        )

        saved_user = await self.user_repo.save(user)
        return self._to_response_dto(saved_user)

    async def get_user(self, user_id: str) -> Optional[UserResponseDTO]:
        """获取用户"""
        user = await self.user_repo.get_by_id(UserId.from_string(user_id))
        if not user:
            return None

        return self._to_response_dto(user)

    async def get_user_by_email(self, email: str) -> Optional[UserResponseDTO]:
        """根据邮箱获取用户"""
        user = await self.user_repo.get_by_email(email)
        if not user:
            return None

        return self._to_response_dto(user)

    async def get_user_by_username(self, username: str) -> Optional[UserResponseDTO]:
        """根据用户名获取用户"""
        user = await self.user_repo.get_by_username(username)
        if not user:
            return None

        return self._to_response_dto(user)

    async def update_user(
        self, user_id: str, dto: UpdateUserDTO
    ) -> Optional[UserResponseDTO]:
        """更新用户"""
        user = await self.user_repo.get_by_id(UserId.from_string(user_id))
        if not user:
            raise ValueError("用户不存在")

        # 检查邮箱和用户名是否已被其他用户使用
        if dto.email and dto.email != user.email:
            if await self.user_repo.email_exists(dto.email):
                raise ValueError("邮箱已被使用")
            user.update_email(dto.email)

        if dto.username and dto.username != user.username:
            if await self.user_repo.username_exists(dto.username):
                raise ValueError("用户名已被使用")
            user.update_username(dto.username)

        if dto.full_name:
            user.update_full_name(dto.full_name)
        if dto.bio is not None:
            user.update_bio(dto.bio)
        if dto.avatar_url is not None:
            user.update_avatar(dto.avatar_url)

        saved_user = await self.user_repo.save(user)
        return self._to_response_dto(saved_user)

    async def delete_user(self, user_id: str) -> bool:
        """删除用户"""
        return await self.user_repo.delete(UserId.from_string(user_id))

    async def list_users(
        self, limit: int = 100, offset: int = 0
    ) -> UserListDTO:
        """获取用户列表"""
        users = await self.user_repo.get_all(limit=limit, offset=offset)
        user_dtos = [self._to_response_dto(u) for u in users]

        return UserListDTO(
            users=user_dtos,
            total=len(user_dtos),
            page=offset // limit + 1 if limit > 0 else 1,
            per_page=limit,
        )

    async def get_active_users(self) -> List[UserResponseDTO]:
        """获取活跃用户"""
        users = await self.user_repo.get_active_users()
        return [self._to_response_dto(u) for u in users]

    async def activate_user(self, user_id: str) -> UserResponseDTO:
        """激活用户"""
        user = await self.user_repo.get_by_id(UserId.from_string(user_id))
        if not user:
            raise ValueError("用户不存在")

        user.activate()
        saved_user = await self.user_repo.save(user)
        return self._to_response_dto(saved_user)

    async def deactivate_user(self, user_id: str) -> UserResponseDTO:
        """停用用户"""
        user = await self.user_repo.get_by_id(UserId.from_string(user_id))
        if not user:
            raise ValueError("用户不存在")

        user.deactivate()
        saved_user = await self.user_repo.save(user)
        return self._to_response_dto(saved_user)

    def _to_response_dto(self, user: User) -> UserResponseDTO:
        """转换为响应DTO"""
        return UserResponseDTO(
            user_id=str(user.user_id),
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            is_active=user.is_active,
            is_superuser=user.is_superuser,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_login=user.last_login,
            avatar_url=user.avatar_url,
            bio=user.bio,
            project_ids=list(user.project_ids),
        )
