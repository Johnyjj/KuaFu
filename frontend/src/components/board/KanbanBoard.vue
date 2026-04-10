<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="status in statuses"
      :key="status"
      :status="status"
      :tasks="tasksStore.byStatus[status]"
      @open-task="openTask"
    />
  </div>
</template>

<script setup lang="ts">
import type { TaskStatus } from '@/types'
import { useTasksStore } from '@/stores/tasks'
import KanbanColumn from './KanbanColumn.vue'

const tasksStore = useTasksStore()
const statuses: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked']
const emit = defineEmits<{ openTask: [id: string] }>()

function openTask(id: string) {
  tasksStore.openTask(id)
  emit('openTask', id)
}
</script>

<style scoped>
.kanban-board { display: flex; gap: 16px; min-height: 100%; align-items: flex-start; }
</style>
