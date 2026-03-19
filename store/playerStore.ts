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
  currentTime: number
  duration: number
  repeatMode: 'none' | 'all' | 'one'
  playbackSpeed: number

  // Actions
  setPlayer: (player: YTPlayer) => void
  playSong: (song: Song, queue?: Song[]) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  setVolume: (volume: number) => void
  setIsPlaying: (playing: boolean) => void
  setIsLoading: (loading: boolean) => void
  setQueue: (songs: Song[]) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  seek: (seconds: number) => void
  seekBackward: (n?: number) => void
  seekForward: (n?: number) => void
  replayFromStart: () => void
  setPlaybackSpeed: (speed: number) => void
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
      currentTime: 0,
      duration: 0,
      repeatMode: 'all',
      playbackSpeed: 1,

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
          currentTime: 0,
          duration: 0,
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
        const { queue, currentIndex, isShuffle, player, repeatMode } = get()
        if (!queue.length) return

        let nextIndex: number

        if (isShuffle) {
          nextIndex = Math.floor(Math.random() * queue.length)
        } else {
          nextIndex = currentIndex + 1
          if (nextIndex >= queue.length) {
            if (repeatMode === 'all') {
              nextIndex = 0
            } else {
              // End of queue, stop playing
              set({ isPlaying: false })
              player?.pauseVideo()
              return
            }
          }
        }

        const nextSong = queue[nextIndex]
        set({ currentSong: nextSong, currentIndex: nextIndex, isLoading: true, currentTime: 0, duration: 0 })
        player?.loadVideoById(nextSong.youtubeVideoId)
      },

      previous: () => {
        const { queue, currentIndex, player } = get()
        if (!queue.length) return

        const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
        const prevSong = queue[prevIndex]
        set({ currentSong: prevSong, currentIndex: prevIndex, isLoading: true, currentTime: 0, duration: 0 })
        player?.loadVideoById(prevSong.youtubeVideoId)
      },

      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

      toggleRepeat: () =>
        set((state) => ({
          repeatMode:
            state.repeatMode === 'none' ? 'all' : state.repeatMode === 'all' ? 'one' : 'none',
        })),

      setVolume: (volume) => {
        const { player } = get()
        const clamped = clamp(volume, 0, 100)
        set({ volume: clamped })
        player?.setVolume(clamped)
      },

      setIsPlaying: (isPlaying) => set({ isPlaying }),

      setIsLoading: (isLoading) => set({ isLoading }),

      setQueue: (songs) => set({ queue: songs }),

      setCurrentTime: (currentTime) => set({ currentTime }),

      setDuration: (duration) => set({ duration }),

      seek: (seconds) => {
        const { player, duration } = get()
        if (!player) return
        const clamped = clamp(seconds, 0, duration > 0 ? duration : seconds)
        player.seekTo(clamped, true)
        set({ currentTime: clamped })
      },

      seekBackward: (n = 10) => {
        const { currentTime } = get()
        get().seek(Math.max(0, currentTime - n))
      },

      seekForward: (n = 10) => {
        const { currentTime, duration } = get()
        get().seek(duration > 0 ? Math.min(duration, currentTime + n) : currentTime + n)
      },

      replayFromStart: () => {
        const { player } = get()
        if (!player) return
        player.seekTo(0, true)
        player.playVideo()
        set({ currentTime: 0, isPlaying: true })
      },

      setPlaybackSpeed: (playbackSpeed) => {
        const { player } = get()
        set({ playbackSpeed })
        player?.setPlaybackRate(playbackSpeed)
      },
    }),
    { name: 'PlayerStore' }
  )
)
