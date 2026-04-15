import { client } from './client'
import type { Project, User, ProjectStats } from './types'

export const projectsApi = {
  list: () => client.get<Project[]>('/projects'),
  get: (id: string) => client.get<Project>(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    client.post<Project>('/projects', data),
  update: (id: string, data: Partial<Project>) =>
    client.patch<Project>(`/projects/${id}`, data),
  delete: (id: string) => client.delete(`/projects/${id}`),
  getMembers: (id: string) => client.get<User[]>(`/projects/${id}/members`),
  addMember: (id: string, userId: string) =>
    client.post(`/projects/${id}/members`, { user_id: userId }),
  removeMember: (id: string, userId: string) =>
    client.delete(`/projects/${id}/members/${userId}`),
  getStats: (id: string) => client.get<ProjectStats>(`/projects/${id}/stats`),
  export: (id: string) =>
    client.get(`/projects/${id}/export`, { responseType: 'blob' }),
}
