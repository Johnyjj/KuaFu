import { client } from './client'
import type { Module } from './types'

export interface ModuleCreate {
  name: string
  description?: string
  owner_id?: string
  order?: number
}

export interface ModuleUpdate {
  name?: string
  description?: string
  owner_id?: string
  order?: number
}

export const modulesApi = {
  list: (projectId: string) =>
    client.get<Module[]>(`/projects/${projectId}/modules`),
  create: (projectId: string, data: ModuleCreate) =>
    client.post<Module>(`/projects/${projectId}/modules`, data),
  update: (id: string, data: ModuleUpdate) =>
    client.patch<Module>(`/modules/${id}`, data),
  delete: (id: string) =>
    client.delete(`/modules/${id}`),
}
