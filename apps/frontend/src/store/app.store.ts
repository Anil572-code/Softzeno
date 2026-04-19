import { create } from 'zustand'

interface AppStore {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  currency: string
  timezone: string
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setCurrency: (currency: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  currency: 'USD',
  timezone: 'UTC',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setCurrency: (currency) => set({ currency }),
}))
