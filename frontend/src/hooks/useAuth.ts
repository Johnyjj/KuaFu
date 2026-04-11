import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/api/auth'

export function useAuth() {
  const token = localStorage.getItem('access_token')

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then(r => r.data),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const isAdmin = useMemo(() => user?.role === 'admin', [user])

  return { user, isAdmin, isLoading, isLoggedIn: !!token }
}
