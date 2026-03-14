import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Song, YTPlayer } from '@/types'
import { clamp } from '@/lib/utils'

interface PlayerStore {
  // State
  currentSong: Song | null
  queue: Song[]
  currentIndex: number
  isPlaying: boolean
  isShuffle: boolean
  volume: number
  isLoading: boolean
  player: YTPlayer | null

  // Actions
  setPlayer: (player: YTPlayer) => void
  playSong: (song: Song, queue?: Song[]) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  toggleShuffle: () => void
  setVolume: (volume: number) => void
  setIsPlaying: (playing: boolean) => void
  setIsLoading: (loading: boolean) => void
  setQueue: (songs: Song[]) => void
}

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    (set, get) => ({
      currentSong: null,
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      isShuffle: false,
      volume: 80,
      isLoading: false,
      player: null,

      setPlayer: (player) => set({ player }),

      playSong: (song, queue) => {
        const { player } = get()
        const newQueue = queue ?? [song]
        const index = newQueue.findIndex((s) => s.id === song.id)

        set({
          currentSong: song,
          queue: newQueue,
          currentIndex: index >= 0 ? index : 0,
          isPlaying: true,
          isLoading: true,
        })

        player?.loadVideoById(song.youtubeVideoId)
      },

      togglePlay: () => {
        const { isPlaying, player } = get()
        if (!player) return
        if (isPlaying) {
          player.pauseVideo()
        } else {
          player.playVideo()
        }
        set({ isPlaying: !isPlaying })
      },

      next: () => {
        const { queue, currentIndex, isShuffle, player } = get()
        if (!queue.length) return

        const nextIndex = isShuffle
          ? Math.floor(Math.random() * queue.length)
          : (currentIndex + 1) % queue.length

        const nextSong = queue[nextIndex]
        set({ currentSong: nextSong, currentIndex: nextIndex, isLoading: true })
        player?.loadVideoById(nextSong.youtubeVideoId)
      },

      previous: () => {
        const { queue, currentIndex, player } = get()
        if (!queue.length) return

        const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
        const prevSong = queue[prevIndex]
        set({ currentSong: prevSong, currentIndex: prevIndex, isLoading: true })
        player?.loadVideoById(prevSong.youtubeVideoId)
      },

      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

      setVolume: (volume) => {
        const { player } = get()
        const clamped = clamp(volume, 0, 100)
        set({ volume: clamped })
        player?.setVolume(clamped)
      },

      setIsPlaying: (isPlaying) => set({ isPlaying }),

      setIsLoading: (isLoading) => set({ isLoading }),

      setQueue: (songs) => set({ queue: songs }),
    }),
    { name: 'PlayerStore' }
  )
)
