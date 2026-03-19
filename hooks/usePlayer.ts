'use client'

import { usePlayerStore } from '@/store/playerStore'
import type { Song } from '@/types'

export function usePlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const queue = usePlayerStore((s) => s.queue)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isShuffle = usePlayerStore((s) => s.isShuffle)
  const volume = usePlayerStore((s) => s.volume)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const playbackSpeed = usePlayerStore((s) => s.playbackSpeed)

  const playSong = usePlayerStore((s) => s.playSong)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const seek = usePlayerStore((s) => s.seek)
  const seekBackward = usePlayerStore((s) => s.seekBackward)
  const seekForward = usePlayerStore((s) => s.seekForward)
  const replayFromStart = usePlayerStore((s) => s.replayFromStart)
  const setPlaybackSpeed = usePlayerStore((s) => s.setPlaybackSpeed)

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
    currentTime,
    duration,
    repeatMode,
    playbackSpeed,
    playSong,
    playPlaylist,
    togglePlay,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    seek,
    seekBackward,
    seekForward,
    replayFromStart,
    setPlaybackSpeed,
  }
}
