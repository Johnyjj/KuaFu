import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'

vi.mock('@/api/auth')

describe('auth store', () => {
  beforeEach(() => { setActivePinia(createPinia()) })

  it('isLoggedIn is false initially with no token', () => {
    localStorage.clear()
    const store = useAuthStore()
    expect(store.isLoggedIn).toBe(false)
  })

  it('login stores token and fetches user', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      data: { access_token: 'tok', user_id: '1', role: 'admin', name: 'A' }
    } as any)
    vi.mocked(authApi.me).mockResolvedValue({
      data: { id: '1', name: 'A', email: 'a@b.com', role: 'admin', created_at: '' }
    } as any)

    const store = useAuthStore()
    await store.login('a@b.com', 'pass')
    expect(store.isLoggedIn).toBe(true)
    expect(store.isAdmin).toBe(true)
  })

  it('logout clears state', async () => {
    const store = useAuthStore()
    store.logout()
    expect(store.isLoggedIn).toBe(false)
    expect(store.user).toBeNull()
  })
})
