import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PlaylistToEdit {
  id: string
  name: string
  description?: string
  coverImage?: string | null
  isPublic: boolean
}

interface UIStore {
  isSidebarOpen: boolean
  isCreatePlaylistModalOpen: boolean
  isEditPlaylistModalOpen: boolean
  isAddSongModalOpen: boolean
  activePlaylistId: string | null
  playlistToEdit: PlaylistToEdit | null
  searchQuery: string

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openCreatePlaylistModal: () => void
  closeCreatePlaylistModal: () => void
  openEditPlaylistModal: (playlist: PlaylistToEdit) => void
  closeEditPlaylistModal: () => void
  openAddSongModal: (playlistId: string) => void
  closeAddSongModal: () => void
  setSearchQuery: (query: string) => void
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      isSidebarOpen: true,
      isCreatePlaylistModalOpen: false,
      isEditPlaylistModalOpen: false,
      isAddSongModalOpen: false,
      activePlaylistId: null,
      playlistToEdit: null,
      searchQuery: '',

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

      openCreatePlaylistModal: () => set({ isCreatePlaylistModalOpen: true }),

      closeCreatePlaylistModal: () => set({ isCreatePlaylistModalOpen: false }),

      openEditPlaylistModal: (playlist) =>
        set({ isEditPlaylistModalOpen: true, playlistToEdit: playlist }),

      closeEditPlaylistModal: () =>
        set({ isEditPlaylistModalOpen: false, playlistToEdit: null }),

      openAddSongModal: (playlistId) =>
        set({ isAddSongModalOpen: true, activePlaylistId: playlistId }),

      closeAddSongModal: () =>
        set({ isAddSongModalOpen: false, activePlaylistId: null }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    { name: 'UIStore' }
  )
)
