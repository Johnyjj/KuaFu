"""项目API客户端"""

import { apiClient } from './client'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project'

class ProjectApi {
  async getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects')
  }

  async getProject(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${projectId}`)
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>('/projects', data)
  }

  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${projectId}`, data)
  }

  async deleteProject(projectId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}`)
  }

  async addMember(projectId: string, userId: string): Promise<Project> {
    return apiClient.post<Project>(`/projects/${projectId}/members`, { user_id: userId })
  }

  async removeMember(projectId: string, userId: string): Promise<Project> {
    return apiClient.delete<Project>(`/projects/${projectId}/members/${userId}`)
  }

  async getProjectHealth(projectId: string) {
    return apiClient.get(`/projects/${projectId}/health`)
  }

  async getProjectVelocity(projectId: string, days?: number) {
    const params = days ? { days } : {}
    return apiClient.get(`/projects/${projectId}/velocity`, { params })
  }

  async getProjectTasks(projectId: string) {
    return apiClient.get(`/projects/${projectId}/tasks`)
  }
}

export const projectApi = new ProjectApi()
