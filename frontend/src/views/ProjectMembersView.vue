<template>
  <div class="members-view">
    <div class="page-header">
      <RouterLink :to="`/projects/${route.params.id}/board`" class="back-link">
        <ChevronLeft :size="16" />项目看板
      </RouterLink>
      <h2 class="page-title">成员管理</h2>
    </div>

    <div class="card">
      <div class="add-member">
        <select v-model="selectedUserId" class="user-select">
          <option value="">选择用户添加…</option>
          <option v-for="u in availableUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
        </select>
        <button class="btn-primary" :disabled="!selectedUserId" @click="handleAdd">添加</button>
      </div>

      <div class="member-list">
        <div v-for="m in members" :key="m.id" class="member-row">
          <div class="member-avatar">{{ m.name[0] }}</div>
          <div class="member-info">
            <span class="member-name">{{ m.name }}</span>
            <span class="member-email">{{ m.email }}</span>
          </div>
          <button class="btn-ghost remove-btn" @click="handleRemove(m.id)">移除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import { projectsApi } from '@/api/projects'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

const route = useRoute()
const members = ref<User[]>([])
const allUsers = ref<User[]>([])
const selectedUserId = ref('')

const availableUsers = computed(() =>
  allUsers.value.filter(u => !members.value.some(m => m.id === u.id))
)

onMounted(async () => {
  const [mRes, uRes] = await Promise.all([
    projectsApi.getMembers(route.params.id as string),
    authApi.listUsers(),
  ])
  members.value = mRes.data
  allUsers.value = uRes.data
})

async function handleAdd() {
  if (!selectedUserId.value) return
  await projectsApi.addMember(route.params.id as string, selectedUserId.value)
  const added = allUsers.value.find(u => u.id === selectedUserId.value)
  if (added) members.value.push(added)
  selectedUserId.value = ''
}

async function handleRemove(userId: string) {
  await projectsApi.removeMember(route.params.id as string, userId)
  members.value = members.value.filter(m => m.id !== userId)
}
</script>

<style scoped>
.members-view { max-width: 640px; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.back-link { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--color-primary); }
.page-title { flex: 1; font-size: 20px; font-weight: 700; }
.add-member { display: flex; gap: 8px; margin-bottom: 16px; }
.user-select { flex: 1; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 8px 10px; font-size: 13px; }
.member-list { display: flex; flex-direction: column; gap: 0; }
.member-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.member-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary); color: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.member-info { flex: 1; }
.member-name { font-size: 13px; font-weight: 600; display: block; }
.member-email { font-size: 11px; color: var(--color-text-muted); }
.remove-btn { color: var(--color-destructive); font-size: 12px; }
</style>
