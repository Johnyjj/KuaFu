import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password)
    token.value = res.data.access_token
    localStorage.setItem('access_token', res.data.access_token)
    await fetchMe()
  }

  async function fetchMe() {
    const res = await authApi.me()
    user.value = res.data
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
  }

  return { user, token, isLoggedIn, isAdmin, login, fetchMe, logout }
})
