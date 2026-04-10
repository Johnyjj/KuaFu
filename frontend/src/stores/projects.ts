import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectsApi } from '@/api/projects'
import type { Project } from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)

  async function fetchProjects() {
    loading.value = true
    try {
      const res = await projectsApi.list()
      projects.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function createProject(name: string, description?: string) {
    const res = await projectsApi.create({ name, description })
    projects.value.unshift(res.data)
    return res.data
  }

  return { projects, loading, fetchProjects, createProject }
})
