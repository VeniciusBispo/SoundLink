import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Song, Playlist } from '@/types'

interface ContinueWatchingState {
  lastPlayedSong: Song | null
  lastPlaylist: Playlist | null
  progress: number
  updatedAt: number
  updateContinueWatching: (song: Song, playlist: Playlist | null, progress: number) => void
  clearContinueWatching: () => void
}

export const useContinueWatchingStore = create<ContinueWatchingState>()(
  persist(
    (set) => ({
      lastPlayedSong: null,
      lastPlaylist: null,
      progress: 0,
      updatedAt: 0,

      updateContinueWatching: (song, playlist, progress) => set({
        lastPlayedSong: song,
        lastPlaylist: playlist,
        progress,
        updatedAt: Date.now()
      }),

      clearContinueWatching: () => set({
        lastPlayedSong: null,
        lastPlaylist: null,
        progress: 0,
        updatedAt: 0
      })
    }),
    {
      name: 'soundlink-continue-watching',
    }
  )
)
