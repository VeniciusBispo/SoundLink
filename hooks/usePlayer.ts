'use client'

import { usePlayerStore } from '@/store/playerStore'
import type { Song } from '@/types'

/**
 * Convenience hook that exposes the player actions and state.
 */
export function usePlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const queue = usePlayerStore((s) => s.queue)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isShuffle = usePlayerStore((s) => s.isShuffle)
  const volume = usePlayerStore((s) => s.volume)
  const isLoading = usePlayerStore((s) => s.isLoading)

  const playSong = usePlayerStore((s) => s.playSong)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const setVolume = usePlayerStore((s) => s.setVolume)

  const playPlaylist = (songs: Song[], startIndex = 0) => {
    if (!songs.length) return
    playSong(songs[startIndex], songs)
  }

  return {
    currentSong,
    queue,
    isPlaying,
    isShuffle,
    volume,
    isLoading,
    playSong,
    playPlaylist,
    togglePlay,
    next,
    previous,
    toggleShuffle,
    setVolume,
  }
}
