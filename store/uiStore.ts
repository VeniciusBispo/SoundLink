import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIStore {
  isSidebarOpen: boolean
  isCreatePlaylistModalOpen: boolean
  isAddSongModalOpen: boolean
  activePlaylistId: string | null
  searchQuery: string

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openCreatePlaylistModal: () => void
  closeCreatePlaylistModal: () => void
  openAddSongModal: (playlistId: string) => void
  closeAddSongModal: () => void
  setSearchQuery: (query: string) => void
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      isSidebarOpen: true,
      isCreatePlaylistModalOpen: false,
      isAddSongModalOpen: false,
      activePlaylistId: null,
      searchQuery: '',

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

      openCreatePlaylistModal: () => set({ isCreatePlaylistModalOpen: true }),

      closeCreatePlaylistModal: () => set({ isCreatePlaylistModalOpen: false }),

      openAddSongModal: (playlistId) =>
        set({ isAddSongModalOpen: true, activePlaylistId: playlistId }),

      closeAddSongModal: () =>
        set({ isAddSongModalOpen: false, activePlaylistId: null }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    { name: 'UIStore' }
  )
)
