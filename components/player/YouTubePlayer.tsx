'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { loadYouTubeAPI } from '@/services/youtubeService'
import type { YTPlayer } from '@/types'

/**
 * Invisible component that mounts the YouTube IFrame Player and wires it
 * to the global Zustand player store.
 */
export default function YouTubePlayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const isReadyRef = useRef(false)

  const setPlayer = usePlayerStore((s) => s.setPlayer)
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying)
  const setIsLoading = usePlayerStore((s) => s.setIsLoading)
  const next = usePlayerStore((s) => s.next)
  const volume = usePlayerStore((s) => s.volume)
  const playbackSpeed = usePlayerStore((s) => s.playbackSpeed)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)

  useEffect(() => {
    loadYouTubeAPI(() => {
      if (!containerRef.current || playerRef.current) return

      playerRef.current = new window.YT.Player(containerRef.current, {
        width: '0',
        height: '0',
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event) => {
            isReadyRef.current = true
            event.target.setVolume(volume)
            setPlayer(event.target)
          },
          onStateChange: (event) => {
            const YTState = window.YT.PlayerState
            switch (event.data) {
              case YTState.PLAYING:
                setIsPlaying(true)
                setIsLoading(false)
                break
              case YTState.PAUSED:
                setIsPlaying(false)
                break
              case YTState.BUFFERING:
                setIsLoading(true)
                break
              case YTState.ENDED: {
                const { repeatMode: latestRepeatMode, replayFromStart, next: nextSong } = usePlayerStore.getState()
                if (latestRepeatMode === 'one') {
                  replayFromStart()
                } else {
                  nextSong()
                }
                break
              }
              default:
                break
            }
          },
        },
      })
    })

    return () => {
      playerRef.current?.destroy()
      playerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep volume in sync without recreating the player
  useEffect(() => {
    if (isReadyRef.current) {
      playerRef.current?.setVolume(volume)
    }
  }, [volume])

  // Keep playback rate in sync
  useEffect(() => {
    if (isReadyRef.current) {
      playerRef.current?.setPlaybackRate(playbackSpeed)
    }
  }, [playbackSpeed])

  // Poll current time and duration every 500 ms
  useEffect(() => {
    const id = setInterval(() => {
      if (!isReadyRef.current || !playerRef.current) return
      try {
        const ct = playerRef.current.getCurrentTime()
        const dur = playerRef.current.getDuration()
        if (isFinite(ct)) setCurrentTime(ct)
        if (isFinite(dur) && dur > 0) setDuration(dur)
      } catch {
        // player not fully initialised yet
      }
    }, 500)
    return () => clearInterval(id)
  }, [setCurrentTime, setDuration])

  return <div ref={containerRef} className="hidden" aria-hidden="true" />
}
