<template>
  <div class="users-view">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <button class="btn-primary" @click="showForm = true">+ 新建用户</button>
    </div>

    <!-- 新建用户表单 -->
    <div v-if="showForm" class="card create-form">
      <h3>新建用户</h3>
      <div class="form-row">
        <input v-model="form.name" placeholder="姓名" />
        <input v-model="form.email" type="email" placeholder="邮箱" />
        <input v-model="form.password" type="password" placeholder="密码" />
        <select v-model="form.role">
          <option value="member">组员</option>
          <option value="admin">管理员</option>
        </select>
        <button class="btn-primary" @click="handleCreate">创建</button>
        <button class="btn-ghost" @click="showForm = false">取消</button>
      </div>
      <p v-if="createError" class="error">{{ createError }}</p>
    </div>

    <!-- 用户列表 -->
    <div class="card">
      <table class="user-table">
        <thead>
          <tr>
            <th>姓名</th><th>邮箱</th><th>角色</th><th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td><div class="user-cell"><div class="avatar">{{ u.name[0] }}</div>{{ u.name }}</div></td>
            <td>{{ u.email }}</td>
            <td><span class="role-tag" :class="u.role">{{ u.role === 'admin' ? '管理员' : '组员' }}</span></td>
            <td>{{ u.created_at?.slice(0,10) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

const users = ref<User[]>([])
const showForm = ref(false)
const createError = ref('')
const form = ref({ name: '', email: '', password: '', role: 'member' })

onMounted(async () => {
  const res = await authApi.listUsers()
  users.value = res.data
})

async function handleCreate() {
  createError.value = ''
  try {
    const res = await authApi.createUser(form.value)
    users.value.unshift(res.data)
    showForm.value = false
    form.value = { name: '', email: '', password: '', role: 'member' }
  } catch (e: any) {
    createError.value = e.response?.data?.detail || '创建失败'
  }
}
</script>

<style scoped>
.users-view { max-width: 800px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 700; }
.create-form { margin-bottom: 16px; }
.create-form h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
.form-row { display: flex; gap: 8px; flex-wrap: wrap; }
.form-row input, .form-row select {
  flex: 1; min-width: 140px; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 8px 10px; font-size: 13px;
}
.error { color: var(--color-destructive); font-size: 12px; margin-top: 8px; }
.user-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.user-table th { text-align: left; padding: 8px 10px; border-bottom: 2px solid var(--color-border); font-size: 12px; color: var(--color-text-subtle); }
.user-table td { padding: 10px; border-bottom: 1px solid var(--color-border); }
.user-cell { display: flex; align-items: center; gap: 8px; }
.avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--color-primary); color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.role-tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; }
.role-tag.admin { background: #eff6ff; color: #2563eb; }
.role-tag.member { background: #f1f5f9; color: #64748b; }
</style>
