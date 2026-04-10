<template>
  <div class="dashboard">
    <h2 class="page-title">{{ auth.isAdmin ? '项目总览' : '我的工作台' }}</h2>

    <!-- 管理员：统计卡片 -->
    <div v-if="auth.isAdmin" class="stats-grid">
      <StatsCard :icon="FolderKanban" :value="projects.length" label="项目总数" />
      <StatsCard :icon="CheckSquare" :value="totalDone" label="已完成任务" />
      <StatsCard :icon="Clock" :value="totalInProgress" label="进行中任务" />
      <StatsCard :icon="Users" :value="totalMembers" label="参与成员" />
    </div>

    <!-- 管理员：项目进度列表 -->
    <div v-if="auth.isAdmin && projects.length" class="section card">
      <h3 class="section-title">项目进度</h3>
      <ProjectProgressRow
        v-for="p in projects"
        :key="p.id"
        :project="p"
        :progress="projectProgress[p.id] ?? 0"
      />
    </div>

    <!-- 组员：我的任务 -->
    <div v-if="!auth.isAdmin" class="section card">
      <h3 class="section-title">我的任务</h3>
      <div v-if="myTasks.length === 0" class="empty">暂无分配给你的任务</div>
      <div v-for="t in myTasks" :key="t.id" class="my-task-row">
        <span class="task-name">{{ t.title }}</span>
        <StatusBadge :status="t.status" />
        <span class="task-project">{{ projectName(t.project_id) }}</span>
        <RouterLink :to="`/projects/${t.project_id}/board?task=${t.id}`" class="view-link">查看</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FolderKanban, CheckSquare, Clock, Users } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { tasksApi } from '@/api/tasks'
import type { Task } from '@/types'
import StatsCard from '@/components/dashboard/StatsCard.vue'
import ProjectProgressRow from '@/components/dashboard/ProjectProgressRow.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const auth = useAuthStore()
const projectsStore = useProjectsStore()
const projects = computed(() => projectsStore.projects)

const allTasks = ref<Task[]>([])
const projectProgress = ref<Record<string, number>>({})

onMounted(async () => {
  await projectsStore.fetchProjects()
  const results = await Promise.all(projects.value.map(p => tasksApi.list(p.id)))
  allTasks.value = results.flatMap(r => r.data)
  for (const p of projects.value) {
    const pt = allTasks.value.filter(t => t.project_id === p.id)
    projectProgress.value[p.id] = pt.length
      ? Math.round(pt.reduce((s, t) => s + t.progress, 0) / pt.length)
      : 0
  }
})

const totalDone = computed(() => allTasks.value.filter(t => t.status === 'done').length)
const totalInProgress = computed(() => allTasks.value.filter(t => t.status === 'in_progress').length)
const totalMembers = computed(() => {
  const ids = new Set(allTasks.value.map(t => t.assignee?.id).filter(Boolean))
  return ids.size
})
const myTasks = computed(() =>
  allTasks.value.filter(t => t.assignee?.id === auth.user?.id && t.status !== 'done')
)
function projectName(id: string) {
  return projects.value.find(p => p.id === id)?.name ?? ''
}
</script>

<style scoped>
.dashboard { max-width: 900px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.section { margin-bottom: 20px; }
.section-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--color-foreground); }
.empty { font-size: 13px; color: var(--color-text-muted); text-align: center; padding: 20px 0; }
.my-task-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--color-border); font-size: 13px;
}
.task-name { flex: 1; font-weight: 600; }
.task-project { color: var(--color-text-muted); font-size: 12px; }
.view-link { color: var(--color-primary); font-size: 12px; font-weight: 600; }
</style>
