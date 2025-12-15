"""用户领域服务"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from ..entities import User, Task, Project
from ..value_objects.user_id import UserId


class UserDomainService:
    """用户领域服务 - 处理复杂的用户业务逻辑"""

    @staticmethod
    def can_user_delete_account(user: User) -> bool:
        """检查用户是否可以删除账户"""
        # 检查用户是否有活跃的项目
        if len(user.project_ids) > 0:
            return False
        return True

    @staticmethod
    def can_user_transfer_ownership(
        user: User, project: Project
    ) -> bool:
        """检查用户是否可以转移项目所有权"""
        return project.is_owner(user.user_id)

    @staticmethod
    def get_user_productivity_metrics(
        user: User, tasks: List[Task]
    ) -> Dict[str, Any]:
        """获取用户生产力指标"""
        user_tasks = [t for t in tasks if t.assignee_id == user.user_id]

        if not user_tasks:
            return {
                "total_tasks": 0,
                "completed_tasks": 0,
                "completion_rate": 0,
                "average_completion_time": 0,
                "on_time_rate": 0,
            }

        completed_tasks = [t for t in user_tasks if t.is_completed()]
        total_tasks = len(user_tasks)
        completed_count = len(completed_tasks)

        # 完成率
        completion_rate = (
            (completed_count / total_tasks) * 100 if total_tasks > 0 else 0
        )

        # 平均完成时间
        completion_times = []
        for task in completed_tasks:
            if task.completed_at:
                duration = (task.completed_at - task.created_at).days
                completion_times.append(duration)

        avg_completion_time = (
            sum(completion_times) / len(completion_times)
            if completion_times else 0
        )

        # 按时完成率
        on_time_count = 0
        for task in completed_tasks:
            if task.completed_at and task.due_date:
                if task.completed_at <= task.due_date:
                    on_time_count += 1

        on_time_rate = (
            (on_time_count / completed_count) * 100
            if completed_count > 0 else 0
        )

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_count,
            "completion_rate": round(completion_rate, 2),
            "average_completion_time": round(avg_completion_time, 1),
            "on_time_rate": round(on_time_rate, 2),
        }

    @staticmethod
    def get_user_workload_summary(
        user: User, tasks: List[Task], days: int = 30
    ) -> Dict[str, Any]:
        """获取用户工作量摘要"""
        user_tasks = [t for t in tasks if t.assignee_id == user.user_id]

        if not user_tasks:
            return {
                "current_load": 0,
                "estimated_hours": 0,
                "upcoming_deadlines": [],
                "overdue_tasks": 0,
            }

        # 当前负载（活跃任务数量）
        current_load = len([t for t in user_tasks if t.is_active()])

        # 估算工作量
        from .task_domain_service import TaskDomainService
        estimated_hours = sum(
            TaskDomainService.estimate_effort_hours(t)
            for t in user_tasks
        )

        # 即将到期的任务
        today = datetime.utcnow()
        upcoming_deadlines = []
        for task in user_tasks:
            if task.due_date and task.due_date > today:
                days_until = (task.due_date - today).days
                if days_until <= days:
                    upcoming_deadlines.append({
                        "task_id": str(task.task_id),
                        "title": task.title,
                        "due_date": task.due_date.isoformat(),
                        "days_remaining": days_until,
                    })

        upcoming_deadlines.sort(key=lambda x: x["days_remaining"])

        # 逾期任务
        overdue_tasks = len([t for t in user_tasks if t.is_overdue()])

        return {
            "current_load": current_load,
            "estimated_hours": round(estimated_hours, 1),
            "upcoming_deadlines": upcoming_deadlines,
            "overdue_tasks": overdue_tasks,
        }

    @staticmethod
    def suggest_user_improvements(
        user: User, tasks: List[Task]
    ) -> List[str]:
        """建议用户改进"""
        suggestions = []

        if not tasks:
            return suggestions

        user_tasks = [t for t in tasks if t.assignee_id == user.user_id]

        if not user_tasks:
            return suggestions

        # 检查任务分配不平衡
        active_tasks = [t for t in user_tasks if t.is_active()]
        if len(active_tasks) > 10:
            suggestions.append(
                f"当前有 {len(active_tasks)} 个活跃任务，建议减少工作量"
            )

        # 检查逾期任务
        overdue_count = sum(1 for t in user_tasks if t.is_overdue())
        if overdue_count > 0:
            suggestions.append(
                f"有 {overdue_count} 个任务逾期，建议优先处理"
            )

        # 检查任务完成率
        completed_tasks = [t for t in user_tasks if t.is_completed()]
        if len(user_tasks) > 0:
            completion_rate = len(completed_tasks) / len(user_tasks)
            if completion_rate < 0.5:
                suggestions.append("任务完成率较低，建议重新评估任务优先级")

        # 检查未分配截止日期的任务
        no_deadline_tasks = [
            t for t in active_tasks if t.due_date is None
        ]
        if len(no_deadline_tasks) > 3:
            suggestions.append(
                f"有 {len(no_deadline_tasks)} 个任务未设置截止日期，建议添加"
            )

        # 检查长期未开始的任务
        long_untouched = [
            t for t in active_tasks
            if t.status.status.value == "todo"
            and t.get_age_in_days() > 7
        ]
        if long_untouched:
            suggestions.append(
                f"有 {len(long_untouched)} 个任务创建已久未开始，建议重新评估"
            )

        return suggestions

    @staticmethod
    def get_team_performance_summary(
        users: List[User], tasks: List[Task]
    ) -> Dict[str, Any]:
        """获取团队绩效摘要"""
        if not users:
            return {"total_members": 0}

        total_members = len(users)
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.is_completed()])

        # 整体完成率
        overall_completion_rate = (
            (completed_tasks / total_tasks) * 100
            if total_tasks > 0 else 0
        )

        # 团队成员工作量分布
        workload_distribution = {}
        for user in users:
            user_active_tasks = len([
                t for t in tasks
                if t.assignee_id == user.user_id and t.is_active()
            ])
            workload_distribution[user.username] = user_active_tasks

        # 团队平均生产力
        from .task_domain_service import TaskDomainService
        productivity_scores = []
        for user in users:
            metrics = UserDomainService.get_user_productivity_metrics(
                user, tasks
            )
            productivity_scores.append(metrics["completion_rate"])

        avg_productivity = (
            sum(productivity_scores) / len(productivity_scores)
            if productivity_scores else 0
        )

        # 逾期任务统计
        overdue_tasks = len([t for t in tasks if t.is_overdue()])

        return {
            "total_members": total_members,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "overall_completion_rate": round(overall_completion_rate, 2),
            "workload_distribution": workload_distribution,
            "average_productivity": round(avg_productivity, 2),
            "overdue_tasks": overdue_tasks,
        }

    @staticmethod
    def validate_user_permissions(
        user: User, action: str, resource: str
    ) -> bool:
        """验证用户权限"""
        # 超级用户拥有所有权限
        if user.is_superuser:
            return True

        # 简单的权限检查示例
        permission_map = {
            "create_project": ["active_user"],
            "edit_project": ["project_member", "project_owner"],
            "delete_project": ["project_owner"],
            "create_task": ["project_member"],
            "edit_task": ["task_assignee", "task_reporter"],
            "delete_task": ["task_reporter"],
            "manage_users": ["superuser"],
        }

        required_roles = permission_map.get(action, [])

        # 检查用户角色
        if "active_user" in required_roles and not user.is_active:
            return False

        if "project_member" in required_roles:
            # 检查用户是否为项目成员
            # 这里需要项目上下文，实际实现会更复杂
            return True

        if "project_owner" in required_roles:
            # 检查用户是否为项目所有者
            return user.has_permission("project_owner")

        if "task_assignee" in required_roles:
            # 检查用户是否为任务负责人
            return user.has_permission("task_assignee")

        if "task_reporter" in required_roles:
            # 检查用户是否为任务报告者
            return user.has_permission("task_reporter")

        if "superuser" in required_roles:
            return user.is_superuser

        return False

    @staticmethod
    def get_user_activity_timeline(
        user: User, tasks: List[Task], days: int = 7
    ) -> List[Dict[str, Any]]:
        """获取用户活动时间线"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        user_tasks = [
            t for t in tasks
            if t.assignee_id == user.user_id or t.reporter_id == user.user_id
        ]

        timeline = []

        for task in user_tasks:
            # 任务创建
            if task.created_at >= cutoff_date:
                timeline.append({
                    "date": task.created_at.isoformat(),
                    "type": "task_created",
                    "task_id": str(task.task_id),
                    "task_title": task.title,
                })

            # 任务完成
            if task.completed_at and task.completed_at >= cutoff_date:
                timeline.append({
                    "date": task.completed_at.isoformat(),
                    "type": "task_completed",
                    "task_id": str(task.task_id),
                    "task_title": task.title,
                })

            # 任务状态变更
            if task.updated_at >= cutoff_date:
                timeline.append({
                    "date": task.updated_at.isoformat(),
                    "type": "task_updated",
                    "task_id": str(task.task_id),
                    "task_title": task.title,
                    "status": task.status.status.value,
                })

        # 按日期排序
        timeline.sort(key=lambda x: x["date"], reverse=True)

        return timeline
