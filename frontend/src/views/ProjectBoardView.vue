<template>
  <div class="board-view">
    <div class="board-header">
      <div>
        <h2 class="board-title">{{ currentProject?.name }}</h2>
        <p class="board-sub">{{ currentProject?.description }}</p>
      </div>
      <div class="board-actions">
        <RouterLink v-if="auth.isAdmin" :to="`/projects/${route.params.id}/stats`" class="btn-ghost">
          统计数据
        </RouterLink>
        <RouterLink v-if="auth.isAdmin" :to="`/projects/${route.params.id}/members`" class="btn-ghost">
          成员管理
        </RouterLink>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中…</div>

    <div v-else class="board-content">
      <KanbanBoard @open-task="openDrawer" />
    </div>

    <!-- 右侧任务抽屉 -->
    <TaskDrawer
      v-if="drawerOpen"
      :task="tasksStore.currentTask"
      :logs="tasksStore.currentLogs"
      @close="closeDrawer"
      @submit-log="handleSubmitLog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import KanbanBoard from '@/components/board/KanbanBoard.vue'
import TaskDrawer from '@/components/board/TaskDrawer.vue'

const route = useRoute()
const auth = useAuthStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

const drawerOpen = ref(false)
const loading = ref(false)

const currentProject = computed(() =>
  projectsStore.projects.find(p => p.id === route.params.id)
)

async function loadTasks() {
  loading.value = true
  try { await tasksStore.fetchTasks(route.params.id as string) }
  finally { loading.value = false }
}

onMounted(loadTasks)
watch(() => route.params.id, loadTasks)

onMounted(() => {
  const taskId = route.query.task as string
  if (taskId) openDrawer(taskId)
})

async function openDrawer(taskId: string) {
  await tasksStore.openTask(taskId)
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  tasksStore.closeTask()
}

async function handleSubmitLog(payload: { content: string; progress: number; status: string }) {
  if (!tasksStore.currentTask) return
  await tasksStore.submitLog(tasksStore.currentTask.id, payload.content, payload.progress, payload.status)
}
</script>

<style scoped>
.board-view { position: relative; height: 100%; }
.board-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 20px;
}
.board-title { font-size: 20px; font-weight: 700; color: var(--color-foreground); }
.board-sub { font-size: 13px; color: var(--color-text-muted); margin-top: 2px; }
.board-actions { display: flex; gap: 8px; }
.loading { color: var(--color-text-muted); font-size: 13px; }
.board-content { overflow-x: auto; padding-bottom: 16px; }
</style>
