<template>
  <AuthLayout>
    <div class="login-card">
      <div class="login-header">
        <h1>KuaFu</h1>
        <p>项目管理平台</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label for="email">邮箱</label>
          <input id="email" v-model="email" type="email" placeholder="输入邮箱" required />
        </div>
        <div class="field">
          <label for="password">密码</label>
          <input id="password" v-model="password" type="password" placeholder="输入密码" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="loading" style="width:100%;margin-top:8px;">
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/dashboard')
  } catch {
    error.value = '邮箱或密码错误'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 40px;
  width: 360px;
  box-shadow: var(--shadow-md);
}
.login-header { text-align: center; margin-bottom: 28px; }
.login-header h1 { font-size: 24px; font-weight: 800; color: var(--color-primary); }
.login-header p { color: var(--color-text-muted); font-size: 13px; margin-top: 4px; }
.login-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: var(--color-foreground); }
.field input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 9px 12px;
  font-size: 14px;
  transition: border-color var(--transition-fast);
}
.field input:focus { border-color: var(--color-primary); }
.error { color: var(--color-destructive); font-size: 13px; }
</style>
