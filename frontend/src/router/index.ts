"""Vue Router配置"""

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/projects',
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/projects/ProjectList.vue'),
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('@/views/projects/ProjectDetail.vue'),
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/tasks/TaskList.vue'),
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: () => import('@/views/tasks/TaskDetail.vue'),
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/users/UserList.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
