"""项目状态管理"""

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project'
import { projectApi } from '@/api/projects'

export const useProjectStore = defineStore('project', () => {
  // 状态
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeProjects = computed(() =>
    projects.value.filter(p => p.status === 'active')
  )

  const completedProjects = computed(() =>
    projects.value.filter(p => p.status === 'completed')
  )

  const projectsByOwner = computed(() => (ownerId: string) =>
    projects.value.filter(p => p.owner_id === ownerId)
  )

  // 异步操作
  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      projects.value = await projectApi.getProjects()
    } catch (e: any) {
      error.value = e.message || '获取项目列表失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(projectId: string) {
    loading.value = true
    error.value = null
    try {
      currentProject.value = await projectApi.getProject(projectId)
    } catch (e: any) {
      error.value = e.message || '获取项目详情失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createProject(data: CreateProjectRequest) {
    loading.value = true
    error.value = null
    try {
      const newProject = await projectApi.createProject(data)
      projects.value.unshift(newProject)
      return newProject
    } catch (e: any) {
      error.value = e.message || '创建项目失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProject(projectId: string, data: UpdateProjectRequest) {
    loading.value = true
    error.value = null
    try {
      const updatedProject = await projectApi.updateProject(projectId, data)

      // 更新列表中的项目
      const index = projects.value.findIndex(p => p.project_id === projectId)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      // 更新当前项目
      if (currentProject.value?.project_id === projectId) {
        currentProject.value = updatedProject
      }

      return updatedProject
    } catch (e: any) {
      error.value = e.message || '更新项目失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(projectId: string) {
    loading.value = true
    error.value = null
    try {
      await projectApi.deleteProject(projectId)
      projects.value = projects.value.filter(p => p.project_id !== projectId)

      if (currentProject.value?.project_id === projectId) {
        currentProject.value = null
      }
    } catch (e: any) {
      error.value = e.message || '删除项目失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addMember(projectId: string, userId: string) {
    try {
      await projectApi.addMember(projectId, userId)
      // 重新获取项目以更新成员列表
      await fetchProject(projectId)
    } catch (e: any) {
      error.value = e.message || '添加成员失败'
      throw e
    }
  }

  async function removeMember(projectId: string, userId: string) {
    try {
      await projectApi.removeMember(projectId, userId)
      // 重新获取项目以更新成员列表
      await fetchProject(projectId)
    } catch (e: any) {
      error.value = e.message || '移除成员失败'
      throw e
    }
  }

  // 重置状态
  function resetState() {
    projects.value = []
    currentProject.value = null
    loading.value = false
    error.value = null
  }

  return {
    // 状态
    projects,
    currentProject,
    loading,
    error,

    // 计算属性
    activeProjects,
    completedProjects,
    projectsByOwner,

    // 方法
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    resetState,
  }
})
