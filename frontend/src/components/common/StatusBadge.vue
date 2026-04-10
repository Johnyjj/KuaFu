<template>
  <span class="status-badge" :class="status">{{ labels[status] }}</span>
</template>

<script setup lang="ts">
import type { TaskStatus } from '@/types'
defineProps<{ status: TaskStatus }>()
const labels: Record<TaskStatus, string> = {
  todo: '待处理', in_progress: '进行中', done: '已完成', blocked: '已阻塞'
}
</script>

<style scoped>
.status-badge {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 600; padding: 2px 8px;
  border-radius: 999px;
}
.todo { background: #f1f5f9; color: #64748b; }
.in_progress { background: #fef3c7; color: #d97706; }
.done { background: #f0fdf4; color: #059669; }
.blocked { background: #fef2f2; color: #dc2626; }
</style>
