'use client'

import { useEffect, useRef, useState } from 'react'

interface BlindTestPlayerProps {
  videoId: string
  startTime: number
  duration: number // seconds to play
  onEnd?: () => void
  isPlaying: boolean
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
  }
}

export default function BlindTestPlayer({ videoId, startTime, duration, onEnd, isPlaying }: BlindTestPlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isApiReady, setIsApiReady] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Load API only once
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true)
      }
    } else {
      setIsApiReady(true)
    }
  }, [])

  // 2. Manage Player Lifecycle
  useEffect(() => {
    if (!isApiReady || !videoId || !containerRef.current) return

    let player: any = null

    const createPlayer = () => {
      // YouTube replaces the element, so we create a fresh one each time to avoid React reconciliation issues
      const playerDiv = document.createElement('div')
      containerRef.current?.appendChild(playerDiv)

      player = new (window as any).YT.Player(playerDiv, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          start: startTime
        },
        events: {
          onReady: (event: any) => {
            if (isPlaying) {
              event.target.seekTo(startTime, true)
              event.target.playVideo()
              
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              timeoutRef.current = setTimeout(() => {
                event.target.pauseVideo()
                onEnd?.()
              }, duration * 1000)
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 0) {
              onEnd?.()
            }
          }
        }
      })
      playerRef.current = player
    }

    createPlayer()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (player) {
         try {
           player.destroy()
         } catch (e) {
           // Ignore errors during destruction
         }
      }
      // Clean up the container just in case
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [isApiReady, videoId, startTime, duration, isPlaying])

  return (
    <div className="hidden" aria-hidden="true">
      <div ref={containerRef} />
    </div>
  )
}
