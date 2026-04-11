import { client } from './client'
import type { User, LoginResponse } from './types'

export const authApi = {
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { email, password }),
  me: () => client.get<User>('/auth/me'),
  listUsers: () => client.get<User[]>('/users'),
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    client.post<User>('/users', data),
}
