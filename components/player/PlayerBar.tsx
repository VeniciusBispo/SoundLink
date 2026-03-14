'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi'
import { usePlayer } from '@/hooks/usePlayer'
import { formatDuration } from '@/lib/utils'
import PlayerControls from './PlayerControls'

// Lazy-load the hidden YouTube IFrame (browser-only)
const YouTubePlayer = dynamic(() => import('./YouTubePlayer'), { ssr: false })

export default function PlayerBar() {
  const { currentSong, volume, setVolume } = usePlayer()

  return (
    <>
      {/* Hidden YouTube IFrame player – always mounted so the API is ready */}
      <YouTubePlayer />

      <div className="flex h-[90px] flex-shrink-0 items-center justify-between gap-4 border-t border-white/10 bg-spotify-dark px-4">
        {/* ── Left: current song info ── */}
        <div className="flex w-[30%] min-w-0 items-center gap-3">
          {currentSong ? (
            <>
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {currentSong.title}
                </p>
                <p className="truncate text-xs text-spotify-text">
                  {currentSong.channel}
                </p>
                <p className="text-xs text-spotify-text">
                  {formatDuration(currentSong.duration)}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-spotify-text">No song selected</p>
          )}
        </div>

        {/* ── Center: controls ── */}
        <div className="flex flex-1 flex-col items-center gap-1">
          <PlayerControls />
        </div>

        {/* ── Right: volume ── */}
        <div className="flex w-[30%] items-center justify-end gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 80 : 0)}
            className="text-spotify-text hover:text-white transition-colors"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? (
              <HiVolumeOff className="h-5 w-5" />
            ) : (
              <HiVolumeUp className="h-5 w-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-24 cursor-pointer accent-white"
            aria-label="Volume"
          />
        </div>
      </div>
    </>
  )
}
