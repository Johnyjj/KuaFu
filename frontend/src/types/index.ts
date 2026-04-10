export type UserRole = 'admin' | 'member'
export type ProjectStatus = 'active' | 'completed' | 'archived'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  owner_id: string
  created_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  progress: number
  due_date: string | null
  created_at: string
  updated_at: string
  assignee: { id: string; name: string } | null
}

export interface TaskLog {
  id: string
  content: string
  progress: number
  status: string
  created_at: string
  user: { id: string; name: string }
}

export interface ProjectStats {
  total_tasks: number
  by_status: Record<TaskStatus, number>
  avg_progress: number
  member_stats: Array<{ user_id: string; name: string; total: number; done: number }>
}
