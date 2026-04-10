<template>
  <div class="kanban-column">
    <div class="column-header">
      <div class="column-title">
        <span class="dot" :class="status" />
        <span>{{ labels[status] }}</span>
        <span class="count">{{ tasks.length }}</span>
      </div>
    </div>
    <div class="column-body">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @click="$emit('openTask', task.id)"
      />
      <div v-if="tasks.length === 0" class="empty-col">暂无任务</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '@/types'
import TaskCard from './TaskCard.vue'

defineProps<{ status: TaskStatus; tasks: Task[] }>()
defineEmits<{ openTask: [id: string] }>()

const labels: Record<TaskStatus, string> = {
  todo: '待处理', in_progress: '进行中', done: '已完成', blocked: '已阻塞'
}
</script>

<style scoped>
.kanban-column { display: flex; flex-direction: column; min-width: 260px; flex: 1; }
.column-header { padding: 0 0 12px 0; }
.column-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--color-foreground); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.todo { background: #94a3b8; }
.dot.in_progress { background: #f59e0b; }
.dot.done { background: #059669; }
.dot.blocked { background: #dc2626; }
.count { background: var(--color-muted); color: var(--color-text-muted); font-size: 11px; padding: 1px 6px; border-radius: 999px; }
.column-body { display: flex; flex-direction: column; gap: 8px; min-height: 120px; }
.empty-col { font-size: 12px; color: var(--color-text-subtle); text-align: center; padding: 20px 0; }
</style>
