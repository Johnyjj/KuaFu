"""任务领域服务"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from ..entities import Task
from ..value_objects.task_id import TaskId
from ..value_objects.user_id import UserId
from ..value_objects.task_status import TaskStatus, TaskStatusValue


class TaskDomainService:
    """任务领域服务 - 处理复杂的任务业务逻辑"""

    @staticmethod
    def can_user_modify_task(task: Task, user_id: UserId) -> bool:
        """检查用户是否可以修改任务"""
        return task.can_be_edited_by(user_id)

    @staticmethod
    def can_user_delete_task(task: Task, user_id: UserId) -> bool:
        """检查用户是否可以删除任务"""
        # 只有任务报告者或项目所有者可以删除任务
        return task.reporter_id == user_id

    @staticmethod
    def calculate_task_complexity_score(task: Task) -> int:
        """计算任务复杂度分数（1-10分）"""
        score = 1

        # 基于描述长度
        description_length = len(task.description)
        if description_length > 500:
            score += 2
        elif description_length > 200:
            score += 1

        # 基于截止日期
        if task.due_date:
            days_until_due = (task.due_date - datetime.utcnow()).days
            if days_until_due < 1:
                score += 3
            elif days_until_due < 3:
                score += 2
            elif days_until_due < 7:
                score += 1

        # 基于优先级
        if task.is_high_priority():
            score += 1

        # 基于子任务数量
        if len(task.subtasks) > 3:
            score += 2
        elif len(task.subtasks) > 0:
            score += 1

        return min(score, 10)

    @staticmethod
    def estimate_effort_hours(task: Task) -> float:
        """估算任务工作量（小时）"""
        # 基础工作量：2小时
        base_hours = 2.0

        # 根据复杂度调整
        complexity = TaskDomainService.calculate_task_complexity_score(task)
        complexity_multiplier = 0.5 + (complexity * 0.2)

        # 根据描述长度调整
        description_words = len(task.description.split())
        word_factor = min(description_words / 100, 2.0)

        # 根据截止日期调整（紧急任务可能需要加班）
        urgency_factor = 1.0
        if task.due_date:
            days_until_due = (task.due_date - datetime.utcnow()).days
            if days_until_due < 1:
                urgency_factor = 1.5
            elif days_until_due < 2:
                urgency_factor = 1.2

        estimated_hours = base_hours * complexity_multiplier * (1 + word_factor) * urgency_factor

        return round(estimated_hours, 1)

    @staticmethod
    def get_task_risk_level(task: Task) -> Dict[str, Any]:
        """评估任务风险等级"""
        risk_factors = []
        risk_score = 0

        # 检查逾期风险
        if task.due_date:
            days_until_due = (task.due_date - datetime.utcnow()).days
            if days_until_due < 0:
                risk_factors.append("任务已逾期")
                risk_score += 3
            elif days_until_due < 1:
                risk_factors.append("任务即将逾期")
                risk_score += 2
            elif days_until_due < 3:
                risk_factors.append("任务时间紧迫")
                risk_score += 1

        # 检查未分配
        if task.assignee_id is None:
            risk_factors.append("任务未分配")
            risk_score += 2

        # 检查高优先级且未开始
        if task.is_high_priority() and task.status.status == TaskStatus.TODO:
            risk_factors.append("高优先级任务未开始")
            risk_score += 2

        # 检查子任务过多
        if len(task.subtasks) > 5:
            risk_factors.append("子任务过多")
            risk_score += 1

        # 检查描述过短
        if len(task.description) < 50:
            risk_factors.append("任务描述过短")
            risk_score += 1

        # 确定风险等级
        if risk_score >= 5:
            risk_level = "high"
        elif risk_score >= 3:
            risk_level = "medium"
        elif risk_score >= 1:
            risk_level = "low"
        else:
            risk_level = "minimal"

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "suggestions": TaskDomainService._get_risk_suggestions(risk_factors),
        }

    @staticmethod
    def _get_risk_suggestions(risk_factors: List[str]) -> List[str]:
        """根据风险因素生成建议"""
        suggestions = []

        if "任务已逾期" in risk_factors or "任务即将逾期" in risk_factors:
            suggestions.append("立即重新评估任务优先级和资源分配")
            suggestions.append("考虑将任务分解为更小的子任务")

        if "任务未分配" in risk_factors:
            suggestions.append("尽快将任务分配给合适的团队成员")

        if "高优先级任务未开始" in risk_factors:
            suggestions.append("优先处理高优先级任务")

        if "子任务过多" in risk_factors:
            suggestions.append("考虑合并或删除不必要的子任务")

        if "任务描述过短" in risk_factors:
            suggestions.append("完善任务描述，明确需求和验收标准")

        return suggestions

    @staticmethod
    def find_similar_tasks(
        task: Task, all_tasks: List[Task]
    ) -> List[Task]:
        """查找类似任务（简化实现）"""
        similar_tasks = []

        for other_task in all_tasks:
            if other_task.task_id == task.task_id:
                continue

            similarity_score = 0

            # 基于标签相似度
            common_tags = set(task.tags) & set(other_task.tags)
            similarity_score += len(common_tags) * 2

            # 基于优先级相似度
            if task.priority == other_task.priority:
                similarity_score += 1

            # 基于状态相似度
            if task.status.status == other_task.status.status:
                similarity_score += 1

            # 基于标题关键词
            task_words = set(task.title.lower().split())
            other_words = set(other_task.title.lower().split())
            common_words = task_words & other_words
            similarity_score += len(common_words)

            if similarity_score >= 3:
                similar_tasks.append((other_task, similarity_score))

        # 按相似度排序
        similar_tasks.sort(key=lambda x: x[1], reverse=True)
        return [task for task, _ in similar_tasks[:5]]

    @staticmethod
    def suggest_task_improvements(task: Task) -> List[str]:
        """建议任务改进"""
        suggestions = []

        # 检查描述质量
        if len(task.description) < 100:
            suggestions.append(
                "任务描述过短，建议添加更多细节和验收标准"
            )

        # 检查截止日期
        if not task.due_date:
            suggestions.append("建议为任务设置截止日期")

        # 检查任务分配
        if task.assignee_id is None:
            suggestions.append("任务未分配，建议尽快分配给合适的成员")

        # 检查子任务
        if len(task.subtasks) == 0 and len(task.description) > 200:
            suggestions.append("任务较复杂，建议拆分为子任务")

        # 检查优先级设置
        if task.priority.level.value == "low" and task.due_date:
            days_until_due = (task.due_date - datetime.utcnow()).days
            if days_until_due < 7 and days_until_due > 0:
                suggestions.append(
                    "任务即将到期但优先级较低，建议重新评估"
                )

        # 检查标签
        if len(task.tags) == 0:
            suggestions.append("建议为任务添加相关标签")

        # 检查年龄
        age_days = task.get_age_in_days()
        if age_days > 30 and task.status.status == TaskStatus.TODO:
            suggestions.append("任务创建已久未开始，建议重新评估必要性")

        if not suggestions:
            suggestions.append("任务设置良好，继续保持！")

        return suggestions

    @staticmethod
    def get_workload_distribution(
        tasks: List[Task], user_id: UserId
    ) -> Dict[str, Any]:
        """获取用户工作量分布"""
        user_tasks = [t for t in tasks if t.assignee_id == user_id]

        if not user_tasks:
            return {
                "total_tasks": 0,
                "status_distribution": {},
                "priority_distribution": {},
                "overdue_count": 0,
                "estimated_hours": 0,
            }

        # 状态分布
        status_dist = {}
        for task in user_tasks:
            status = task.status.status.value
            status_dist[status] = status_dist.get(status, 0) + 1

        # 优先级分布
        priority_dist = {}
        for task in user_tasks:
            priority = task.priority.level.value
            priority_dist[priority] = priority_dist.get(priority, 0) + 1

        # 逾期任务
        overdue_count = sum(1 for t in user_tasks if t.is_overdue())

        # 估算总工作量
        total_hours = sum(
            TaskDomainService.estimate_effort_hours(t)
            for t in user_tasks
        )

        return {
            "total_tasks": len(user_tasks),
            "status_distribution": status_dist,
            "priority_distribution": priority_dist,
            "overdue_count": overdue_count,
            "estimated_hours": total_hours,
        }

    @staticmethod
    def can_transition_status(
        task: Task, new_status: TaskStatusValue
    ) -> bool:
        """检查任务状态转换是否有效"""
        return task.status.can_transition_to(new_status)

    @staticmethod
    def get_task_bottlenecks(
        tasks: List[Task]
    ) -> List[Dict[str, Any]]:
        """识别任务瓶颈"""
        bottlenecks = []

        # 查找长期未完成的任务
        long_running_tasks = [
            t for t in tasks
            if t.get_age_in_days() > 14
            and t.status.status in [TaskStatus.TODO, TaskStatus.IN_PROGRESS]
        ]

        for task in long_running_tasks:
            bottlenecks.append({
                "task_id": str(task.task_id),
                "title": task.title,
                "issue": "长期未完成",
                "age_days": task.get_age_in_days(),
                "suggestion": "重新评估任务优先级和资源分配",
            })

        # 查找阻塞的任务
        blocked_tasks = [
            t for t in tasks
            if t.status.status == TaskStatus.BLOCKED
        ]

        for task in blocked_tasks:
            bottlenecks.append({
                "task_id": str(task.task_id),
                "title": task.title,
                "issue": "任务被阻塞",
                "suggestion": "识别并移除阻塞因素",
            })

        return bottlenecks
