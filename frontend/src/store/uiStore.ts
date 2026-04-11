import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  activeTab: 'board' | 'list'
  drawerTaskId: string | null
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: 'board' | 'list') => void
  openDrawer: (taskId: string) => void
  closeDrawer: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeTab: 'board',
  drawerTaskId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  openDrawer: (taskId) => set({ drawerTaskId: taskId }),
  closeDrawer: () => set({ drawerTaskId: null }),
}))
