import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tasksApi } from '@/api/tasks'
import type { Task, TaskLog, TaskStatus } from '@/types'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const currentLogs = ref<TaskLog[]>([])

  const byStatus = computed(() => {
    const groups: Record<TaskStatus, Task[]> = {
      todo: [], in_progress: [], done: [], blocked: []
    }
    for (const t of tasks.value) groups[t.status].push(t)
    return groups
  })

  async function fetchTasks(projectId: string) {
    const res = await tasksApi.list(projectId)
    tasks.value = res.data
  }

  async function openTask(taskId: string) {
    currentTask.value = tasks.value.find(t => t.id === taskId) || null
    const res = await tasksApi.getLogs(taskId)
    currentLogs.value = res.data
  }

  async function submitLog(taskId: string, content: string, progress: number, status: string) {
    const res = await tasksApi.addLog(taskId, { content, progress, status })
    currentLogs.value.unshift(res.data)
    const task = tasks.value.find(t => t.id === taskId)
    if (task) { task.progress = progress; task.status = status as TaskStatus }
    if (currentTask.value?.id === taskId) {
      currentTask.value.progress = progress
      currentTask.value.status = status as TaskStatus
    }
  }

  function closeTask() {
    currentTask.value = null
    currentLogs.value = []
  }

  return { tasks, currentTask, currentLogs, byStatus, fetchTasks, openTask, submitLog, closeTask }
})
