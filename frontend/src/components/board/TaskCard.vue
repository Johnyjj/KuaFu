<template>
  <div class="task-card" @click="$emit('click')">
    <div class="card-top">
      <span class="task-title">{{ task.title }}</span>
      <PriorityBadge :priority="task.priority" />
    </div>
    <div class="card-meta">
      <StatusBadge :status="task.status" />
      <div v-if="task.assignee" class="assignee">
        <span class="avatar">{{ task.assignee.name[0] }}</span>
        <span>{{ task.assignee.name }}</span>
      </div>
    </div>
    <div v-if="task.progress > 0" class="progress-bar">
      <div class="progress-fill" :style="{ width: task.progress + '%' }" />
    </div>
    <div v-if="task.due_date" class="due-date" :class="{ overdue: isOverdue }">
      {{ task.due_date }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import StatusBadge from '@/components/common/StatusBadge.vue'
import PriorityBadge from '@/components/common/PriorityBadge.vue'

const props = defineProps<{ task: Task }>()
defineEmits<{ click: [] }>()

const isOverdue = computed(() =>
  props.task.due_date ? new Date(props.task.due_date) < new Date() : false
)
</script>

<style scoped>
.task-card {
  background: white; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 12px;
  cursor: pointer; transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}
.task-card:hover { box-shadow: var(--shadow-md); border-color: #bfdbfe; transform: translateY(-1px); }
.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.task-title { font-size: 13px; font-weight: 600; color: var(--color-foreground); line-height: 1.4; }
.card-meta { display: flex; align-items: center; justify-content: space-between; }
.assignee { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-muted); }
.avatar {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--color-primary); color: white;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.progress-bar { height: 4px; background: var(--color-border); border-radius: 2px; margin-top: 8px; overflow: hidden; }
.progress-fill { height: 4px; background: var(--color-primary); border-radius: 2px; transition: width 200ms; }
.due-date { font-size: 11px; color: var(--color-text-subtle); margin-top: 6px; }
.due-date.overdue { color: var(--color-destructive); }
</style>
