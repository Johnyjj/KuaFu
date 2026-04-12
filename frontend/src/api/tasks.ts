import { client } from './client'
import type { Task, TaskLog } from './types'

export const tasksApi = {
  list: (projectId: string) =>
    client.get<Task[]>(`/projects/${projectId}/tasks`),
  create: (projectId: string, data: Partial<Task>) =>
    client.post<Task>(`/projects/${projectId}/tasks`, data),
  update: (id: string, data: Partial<Task>) =>
    client.patch<Task>(`/tasks/${id}`, data),
  delete: (id: string) => client.delete(`/tasks/${id}`),
  getLogs: (id: string) => client.get<TaskLog[]>(`/tasks/${id}/logs`),
  addLog: (id: string, data: { content: string; progress: number; status: string }) =>
    client.post<TaskLog>(`/tasks/${id}/logs`, data),
}
