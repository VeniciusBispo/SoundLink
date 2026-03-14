'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { loadYouTubeAPI } from '@/services/youtubeService'

/**
 * Invisible component that mounts the YouTube IFrame Player and wires it
 * to the global Zustand player store.
 */
export default function YouTubePlayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<ReturnType<typeof window.YT.Player> | null>(null)

  const setPlayer = usePlayerStore((s) => s.setPlayer)
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying)
  const setIsLoading = usePlayerStore((s) => s.setIsLoading)
  const next = usePlayerStore((s) => s.next)
  const volume = usePlayerStore((s) => s.volume)

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
              case YTState.ENDED:
                next()
                break
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
    playerRef.current?.setVolume(volume)
  }, [volume])

  return <div ref={containerRef} className="hidden" aria-hidden="true" />
}
