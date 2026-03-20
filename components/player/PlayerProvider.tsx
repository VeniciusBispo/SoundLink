'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePlayerStore } from '@/store/playerStore'

// Instantiate the hidden player component here, at the highest possible level.
const YouTubePlayer = dynamic(() => import('./YouTubePlayer'), { ssr: false })

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)

  // System Media Session API (lock screen / headset controls)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (currentSong) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.title,
          artist: currentSong.channel,
          album: 'SoundLink',
          artwork: [
            { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' },
          ],
        })
      }

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'

      navigator.mediaSession.setActionHandler('play', togglePlay)
      navigator.mediaSession.setActionHandler('pause', togglePlay)
      navigator.mediaSession.setActionHandler('nexttrack', next)
      navigator.mediaSession.setActionHandler('previoustrack', previous)
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null)
        navigator.mediaSession.setActionHandler('pause', null)
        navigator.mediaSession.setActionHandler('nexttrack', null)
        navigator.mediaSession.setActionHandler('previoustrack', null)
      }
    }
  }, [currentSong, isPlaying, togglePlay, next, previous])

  // Handling Page Visibility intentionally. The YT Player continues running naturally
  // in background on desktops and Android devices without video constraints.

  return (
    <>
      <YouTubePlayer />
      {children}
    </>
  )
}
