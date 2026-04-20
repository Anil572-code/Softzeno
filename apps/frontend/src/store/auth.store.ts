import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth.types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (data: { user: User; accessToken: string; refreshToken: string }) => void
  logout: () => void
  updateToken: (token: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (data) => set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateToken: (token) => set({ accessToken: token }),
    }),
    { name: 'auth-storage' }
  )
)
