<template>
  <div class="app-layout">
    <!-- 顶部导航 -->
    <header class="topbar">
      <div class="topbar-left">
        <span class="logo">KuaFu</span>
      </div>
      <div class="topbar-right">
        <span class="user-name">{{ auth.user?.name }}</span>
        <span class="role-badge" :class="auth.isAdmin ? 'admin' : 'member'">
          {{ auth.isAdmin ? '管理员' : '组员' }}
        </span>
        <button class="btn-ghost" @click="handleLogout">退出</button>
      </div>
    </header>

    <div class="layout-body">
      <!-- 左侧项目树 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <RouterLink to="/dashboard" class="sidebar-link" :class="{ active: $route.path === '/dashboard' }">
            <LayoutDashboard :size="16" />
            <span>概览</span>
          </RouterLink>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-label">项目</div>
          <div v-if="projectsStore.loading" class="sidebar-loading">加载中…</div>
          <RouterLink
            v-for="p in projectsStore.projects"
            :key="p.id"
            :to="`/projects/${p.id}/board`"
            class="sidebar-link project-link"
            :class="{ active: $route.params.id === p.id }"
          >
            <FolderKanban :size="15" />
            <span class="project-name">{{ p.name }}</span>
          </RouterLink>
        </div>

        <div v-if="auth.isAdmin" class="sidebar-section sidebar-bottom">
          <RouterLink to="/admin/users" class="sidebar-link" :class="{ active: $route.path === '/admin/users' }">
            <Users :size="16" />
            <span>用户管理</span>
          </RouterLink>
        </div>
      </aside>

      <!-- 内容区 -->
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { LayoutDashboard, FolderKanban, Users } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'

const router = useRouter()
const auth = useAuthStore()
const projectsStore = useProjectsStore()

onMounted(() => projectsStore.fetchProjects())

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout { display: flex; flex-direction: column; height: 100vh; }

.topbar {
  height: 52px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  z-index: 40;
}
.logo { font-weight: 800; font-size: 18px; color: #60a5fa; letter-spacing: -0.5px; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.user-name { color: #cbd5e1; font-size: 13px; }
.role-badge {
  font-size: 11px; font-weight: 600; padding: 2px 8px;
  border-radius: 999px;
}
.role-badge.admin { background: #1d4ed8; color: #bfdbfe; }
.role-badge.member { background: #334155; color: #94a3b8; }
.topbar-right .btn-ghost { color: #94a3b8; font-size: 13px; }
.topbar-right .btn-ghost:hover { color: white; background: rgba(255,255,255,0.1); }

.layout-body { display: flex; flex: 1; overflow: hidden; }

.sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  overflow-y: auto;
  flex-shrink: 0;
}
.sidebar-section { margin-bottom: 16px; }
.sidebar-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  color: var(--color-text-subtle); padding: 0 8px; margin-bottom: 4px;
  letter-spacing: 0.5px;
}
.sidebar-link {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: var(--radius-md);
  font-size: 13px; color: var(--color-text-muted);
  transition: all var(--transition-fast);
  cursor: pointer;
}
.sidebar-link:hover { background: var(--color-muted); color: var(--color-foreground); }
.sidebar-link.active { background: #eff6ff; color: var(--color-primary); font-weight: 600; }
.project-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar-bottom { margin-top: auto; border-top: 1px solid var(--color-border); padding-top: 12px; }
.sidebar-loading { font-size: 12px; color: var(--color-text-subtle); padding: 4px 10px; }

.content { flex: 1; overflow-y: auto; padding: 24px; }
</style>
