import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Playlist, Song } from '@/types'

interface PlaylistStore {
  playlists: Playlist[]
  currentPlaylist: Playlist | null
  isLoading: boolean
  error: string | null

  setPlaylists: (playlists: Playlist[]) => void
  addPlaylist: (playlist: Playlist) => void
  updatePlaylist: (id: string, data: Partial<Playlist>) => void
  removePlaylist: (id: string) => void
  setCurrentPlaylist: (playlist: Playlist | null) => void
  addSongToCurrentPlaylist: (song: Song) => void
  removeSongFromCurrentPlaylist: (songId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePlaylistStore = create<PlaylistStore>()(
  devtools(
    (set) => ({
      playlists: [],
      currentPlaylist: null,
      isLoading: false,
      error: null,

      setPlaylists: (playlists) => set({ playlists }),

      addPlaylist: (playlist) =>
        set((state) => ({ playlists: [playlist, ...state.playlists] })),

      updatePlaylist: (id, data) =>
        set((state) => ({
          playlists: state.playlists.map((p) => (p.id === id ? { ...p, ...data } : p)),
          currentPlaylist:
            state.currentPlaylist?.id === id
              ? { ...state.currentPlaylist, ...data }
              : state.currentPlaylist,
        })),

      removePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
          currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist,
        })),

      setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),

      addSongToCurrentPlaylist: (song) =>
        set((state) => {
          if (!state.currentPlaylist) return state
          return {
            currentPlaylist: {
              ...state.currentPlaylist,
              songs: [
                ...(state.currentPlaylist.songs ?? []),
                {
                  playlistId: state.currentPlaylist.id,
                  songId: song.id,
                  orderIndex: (state.currentPlaylist.songs?.length ?? 0),
                  addedAt: new Date(),
                  song,
                },
              ],
            },
          }
        }),

      removeSongFromCurrentPlaylist: (songId) =>
        set((state) => {
          if (!state.currentPlaylist) return state
          return {
            currentPlaylist: {
              ...state.currentPlaylist,
              songs: state.currentPlaylist.songs?.filter((ps) => ps.songId !== songId) ?? [],
            },
          }
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    { name: 'PlaylistStore' }
  )
)
