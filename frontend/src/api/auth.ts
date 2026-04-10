import { client } from './client'
import type { User } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    client.post<{ access_token: string; user_id: string; role: string; name: string }>(
      '/auth/login', { email, password }
    ),
  logout: () => client.post('/auth/logout'),
  me: () => client.get<User>('/auth/me'),
  listUsers: () => client.get<User[]>('/users'),
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    client.post<User>('/users', data),
}
