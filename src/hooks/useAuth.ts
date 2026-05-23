import { useCallback } from 'react'
import { trpc } from '@/providers/trpc'

export function useAuth() {
  const utils = trpc.useUtils()
  const { data: user, isLoading } = trpc.user.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  })

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem('umkm_session')
      utils.user.me.invalidate()
      window.location.href = '/'
    },
  })

  const logout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  return {
    user: user ?? null,
    isLoading,
    logout,
    isLoggedIn: !!user,
  }
}
