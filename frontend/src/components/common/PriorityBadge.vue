<template>
  <span class="priority-badge" :class="priority">{{ labels[priority] }}</span>
</template>

<script setup lang="ts">
import type { TaskPriority } from '@/types'
defineProps<{ priority: TaskPriority }>()
const labels: Record<TaskPriority, string> = {
  low: '低', medium: '中', high: '高', urgent: '紧急'
}
</script>

<style scoped>
.priority-badge {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 600; padding: 2px 8px;
  border-radius: 999px;
}
.low { background: #f1f5f9; color: #64748b; }
.medium { background: #eff6ff; color: #2563eb; }
.high { background: #fff7ed; color: #ea580c; }
.urgent { background: #fef2f2; color: #dc2626; }
</style>
