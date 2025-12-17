"""项目领域服务"""

from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from ..entities import Project, Task
from ..value_objects.project_id import ProjectId
from ..value_objects.user_id import UserId


class ProjectDomainService:
    """项目领域服务 - 处理复杂的项目业务逻辑"""

    @staticmethod
    def can_user_create_project(user_id: UserId) -> bool:
        """检查用户是否可以创建项目"""
        # 简单规则：任何活跃用户都可以创建项目
        # 实际项目中可能需要检查用户权限、订阅等
        return True

    @staticmethod
    def can_user_modify_project(
        project: Project, user_id: UserId
    ) -> bool:
        """检查用户是否可以修改项目"""
        return project.can_edit(user_id)

    @staticmethod
    def can_user_delete_project(
        project: Project, user_id: UserId
    ) -> bool:
        """检查用户是否可以删除项目"""
        # 只有项目所有者可以删除项目
        return project.is_owner(user_id)

    @staticmethod
    def get_project_health_score(project: Project) -> dict:
        """计算项目健康度分数"""
        progress = project.get_task_progress()
        active_tasks = project.get_active_tasks()

        if progress["total"] == 0:
            return {"score": 0, "status": "no_tasks", "details": "没有任务"}

        # 基础分数：完成百分比
        base_score = progress["percentage"]

        # 检查逾期任务
        overdue_count = sum(
            1 for task in active_tasks if task.is_overdue()
        )
        overdue_penalty = min(overdue_count * 5, 30)

        # 检查阻塞任务
        blocked_count = sum(
            1 for task in active_tasks
            if task.status.status.value == "blocked"
        )
        blocked_penalty = min(blocked_count * 10, 50)

        # 计算最终分数
        final_score = max(0, base_score - overdue_penalty - blocked_penalty)

        # 确定状态
        if final_score >= 80:
            status = "healthy"
        elif final_score >= 60:
            status = "warning"
        elif final_score >= 40:
            status = "critical"
        else:
            status = "critical"

        return {
            "score": round(final_score, 2),
            "status": status,
            "details": {
                "completion_percentage": progress["percentage"],
                "total_tasks": progress["total"],
                "completed_tasks": progress["completed"],
                "active_tasks": len(active_tasks),
                "overdue_tasks": overdue_count,
                "blocked_tasks": blocked_count,
            },
        }

    @staticmethod
    def get_project_burndown_data(
        project: Project, days: int = 30
    ) -> List[dict]:
        """获取项目燃尽图数据"""
        # 这是一个简化的燃尽图计算
        # 实际项目中可能需要根据任务创建时间、完成时间等计算
        tasks = project.tasks
        total_tasks = len(tasks)

        if total_tasks == 0:
            return []

        data = []
        today = datetime.utcnow().date()

        for i in range(days):
            date = today - timedelta(days=i)
            # 简化：假设任务在创建后按比例完成
            completed_ratio = 1 - (i / days)
            remaining = max(0, int(total_tasks * completed_ratio))

            data.append({
                "date": date.isoformat(),
                "remaining_tasks": remaining,
            })

        return data

    @staticmethod
    def find_dependent_tasks(
        task: Task, all_tasks: List[Task]
    ) -> List[Task]:
        """查找依赖任务（简化实现）"""
        # 这里可以实现更复杂的依赖关系逻辑
        # 例如：检查任务A是否依赖于任务B
        dependents = []

        for other_task in all_tasks:
            if other_task.task_id != task.task_id:
                # 简化的依赖检查：检查任务描述中是否提到
                if task.title.lower() in other_task.description.lower():
                    dependents.append(other_task)

        return dependents

    @staticmethod
    def can_complete_project(project: Project) -> Tuple[bool, str]:
        """检查项目是否可以完成"""
        active_tasks = project.get_active_tasks()

        if not active_tasks:
            return True, "可以完成项目"

        # 检查是否有阻塞任务
        blocked_tasks = [
            t for t in active_tasks
            if t.status.status.value == "blocked"
        ]
        if blocked_tasks:
            return False, f"项目中有 {len(blocked_tasks)} 个阻塞任务"

        # 检查是否有逾期任务
        overdue_tasks = [t for t in active_tasks if t.is_overdue()]
        if overdue_tasks:
            return False, f"项目中有 {len(overdue_tasks)} 个逾期任务"

        return False, f"项目中有 {len(active_tasks)} 个未完成任务"

    @staticmethod
    def get_project_velocity(
        project: Project, days: int = 30
    ) -> dict:
        """计算项目速度（简化实现）"""
        today = datetime.utcnow()
        start_date = today - timedelta(days=days)

        completed_tasks = [
            t for t in project.get_completed_tasks()
            if t.completed_at and t.completed_at >= start_date
        ]

        total_points = len(completed_tasks)  # 简化：每个任务1分
        days_worked = days

        velocity = total_points / days_worked if days_worked > 0 else 0

        return {
            "velocity": round(velocity, 2),
            "tasks_completed": len(completed_tasks),
            "period_days": days,
            "average_per_day": round(velocity, 2),
        }

    @staticmethod
    def suggest_project_improvements(
        project: Project
    ) -> List[str]:
        """建议项目改进"""
        suggestions = []
        progress = project.get_task_progress()
        active_tasks = project.get_active_tasks()

        # 检查完成率
        if progress["total"] > 0 and progress["percentage"] < 50:
            suggestions.append(
                "项目进度较慢，建议增加资源或调整范围"
            )

        # 检查逾期任务
        overdue_count = sum(1 for t in active_tasks if t.is_overdue())
        if overdue_count > 0:
            suggestions.append(
                f"有 {overdue_count} 个任务逾期，建议重新评估时间安排"
            )

        # 检查阻塞任务
        blocked_count = sum(
            1 for t in active_tasks
            if t.status.status.value == "blocked"
        )
        if blocked_count > 0:
            suggestions.append(
                f"有 {blocked_count} 个任务被阻塞，建议移除阻塞因素"
            )

        # 检查任务分配
        unassigned_tasks = [
            t for t in active_tasks if t.assignee_id is None
        ]
        if len(unassigned_tasks) > 0:
            suggestions.append(
                f"有 {len(unassigned_tasks)} 个任务未分配，建议尽快分配"
            )

        # 检查优先级分布
        high_priority_count = sum(
            1 for t in active_tasks if t.is_high_priority()
        )
        if high_priority_count > len(active_tasks) * 0.5:
            suggestions.append(
                "高优先级任务过多，建议重新评估优先级"
            )

        if not suggestions:
            suggestions.append("项目运行良好，继续保持！")

        return suggestions
