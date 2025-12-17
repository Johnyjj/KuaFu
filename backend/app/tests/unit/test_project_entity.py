"""项目实体单元测试"""

import pytest
from datetime import datetime
from ...domain.entities.project import Project
from ...domain.value_objects.project_id import ProjectId
from ...domain.value_objects.user_id import UserId


class TestProject:
    """测试项目实体"""

    def test_create_project_success(self):
        """测试成功创建项目"""
        project_id = ProjectId.generate()
        owner_id = UserId.generate()

        project = Project(
            project_id=project_id,
            name="测试项目",
            description="这是一个测试项目",
            owner_id=owner_id,
        )

        assert project.name == "测试项目"
        assert project.description == "这是一个测试项目"
        assert project.owner_id == owner_id
        assert project.status == "planning"
        assert len(project.tasks) == 0

    def test_create_project_without_name(self):
        """测试创建项目失败：缺少名称"""
        project_id = ProjectId.generate()
        owner_id = UserId.generate()

        with pytest.raises(ValueError, match="项目名称不能为空"):
            Project(
                project_id=project_id,
                name="",
                description="这是一个测试项目",
                owner_id=owner_id,
            )

    def test_activate_project(self):
        """测试激活项目"""
        project_id = ProjectId.generate()
        owner_id = UserId.generate()

        project = Project(
            project_id=project_id,
            name="测试项目",
            description="这是一个测试项目",
            owner_id=owner_id,
        )

        project.activate()
        assert project.status == "active"

    def test_complete_project_with_completed_tasks(self):
        """测试完成项目（所有任务已完成）"""
        project_id = ProjectId.generate()
        owner_id = UserId.generate()

        project = Project(
            project_id=project_id,
            name="测试项目",
            description="这是一个测试项目",
            owner_id=owner_id,
        )

        # 添加已完成的任务
        from ...domain.entities.task import Task
        from ...domain.value_objects.task_id import TaskId
        from ...domain.value_objects.task_status import TaskStatusValue

        completed_task = Task(
            task_id=TaskId.generate(),
            project_id=project_id,
            title="已完成任务",
            description="任务描述",
            status=TaskStatusValue.done(),
            reporter_id=owner_id,
        )
        project.add_task(completed_task)

        project.complete()
        assert project.status == "completed"

    def test_add_and_remove_member(self):
        """测试添加和移除成员"""
        project_id = ProjectId.generate()
        owner_id = UserId.generate()

        project = Project(
            project_id=project_id,
            name="测试项目",
            description="这是一个测试项目",
            owner_id=owner_id,
        )

        # 添加成员
        member_id = UserId.generate()
        project.add_member(member_id)
        assert member_id in project.member_ids
        assert project.is_member(member_id)

        # 移除成员
        project.remove_member(member_id)
        assert member_id not in project.member_ids

    def test_remove_owner_fails(self):
        """测试移除项目所有者失败"""
        project_id = ProjectId.generate()
        owner_id = UserId.generate()

        project = Project(
            project_id=project_id,
            name="测试项目",
            description="这是一个测试项目",
            owner_id=owner_id,
        )

        with pytest.raises(ValueError, match="不能移除项目所有者"):
            project.remove_member(owner_id)

    def test_project_progress(self):
        """测试项目进度计算"""
        project_id = ProjectId.generate()
        owner_id = UserId.generate()

        project = Project(
            project_id=project_id,
            name="测试项目",
            description="这是一个测试项目",
            owner_id=owner_id,
        )

        # 添加任务
        from ...domain.entities.task import Task
        from ...domain.value_objects.task_id import TaskId
        from ...domain.value_objects.task_status import TaskStatusValue

        # 3个任务，1个已完成
        for i in range(3):
            task = Task(
                task_id=TaskId.generate(),
                project_id=project_id,
                title=f"任务{i}",
                description="任务描述",
                status=TaskStatusValue.done() if i == 0 else TaskStatusValue.todo(),
                reporter_id=owner_id,
            )
            project.add_task(task)

        progress = project.get_task_progress()
        assert progress["total"] == 3
        assert progress["completed"] == 1
        assert progress["percentage"] == 33.33
