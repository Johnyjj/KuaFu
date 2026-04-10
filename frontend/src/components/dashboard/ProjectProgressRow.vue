<template>
  <RouterLink :to="`/projects/${project.id}/board`" class="project-row">
    <div class="project-info">
      <span class="project-name">{{ project.name }}</span>
      <span class="project-status" :class="project.status">{{ statusLabels[project.status] }}</span>
    </div>
    <div class="project-bar">
      <div class="bar-fill" :style="{ width: progress + '%' }" />
    </div>
    <span class="progress-text">{{ progress }}%</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Project, ProjectStatus } from '@/types'
defineProps<{ project: Project; progress: number }>()
const statusLabels: Record<ProjectStatus, string> = {
  active: '进行中', completed: '已完成', archived: '已归档'
}
</script>

<style scoped>
.project-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid var(--color-border);
  transition: opacity var(--transition-fast);
}
.project-row:hover { opacity: 0.8; }
.project-info { display: flex; align-items: center; gap: 8px; width: 200px; flex-shrink: 0; }
.project-name { font-size: 13px; font-weight: 600; color: var(--color-foreground); }
.project-status { font-size: 11px; padding: 1px 6px; border-radius: 999px; }
.active { background: #eff6ff; color: #2563eb; }
.completed { background: #f0fdf4; color: #059669; }
.archived { background: #f1f5f9; color: #64748b; }
.project-bar { flex: 1; height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden; }
.bar-fill { height: 6px; background: var(--color-primary); border-radius: 3px; transition: width 300ms; }
.progress-text { font-size: 12px; font-weight: 600; color: var(--color-foreground); min-width: 36px; text-align: right; }
</style>
