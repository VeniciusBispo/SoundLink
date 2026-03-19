'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { HiVolumeUp, HiVolumeOff, HiPlay, HiPause } from 'react-icons/hi'
import { usePlayer } from '@/hooks/usePlayer'
import { formatDuration } from '@/lib/utils'
import PlayerControls from './PlayerControls'
import WaveformProgress from './WaveformProgress'

const YouTubePlayer = dynamic(() => import('./YouTubePlayer'), { ssr: false })

export default function PlayerBar() {
  const { currentSong, volume, setVolume, currentTime, duration, seek, isPlaying, togglePlay } = usePlayer()
  const [isHovering, setIsHovering] = useState(false)

  const displayDuration = duration > 0 ? duration : (currentSong?.duration ?? 0)
  const progress = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0

  return (
    <>
      <YouTubePlayer />

      <div className="flex flex-shrink-0 flex-col border-t border-white/5 bg-black/40 backdrop-blur-md pb-safe">
        {/* Progress bar container */}
        <div className="relative group px-6 pt-2 pb-3">
          <div className="flex items-center justify-between mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="text-[11px] text-white/70 font-semibold tabular-nums">
              {formatDuration(Math.floor(currentTime))}
            </span>
            <span className="text-[11px] text-white/40 font-semibold tabular-nums">
              {formatDuration(Math.floor(displayDuration))}
            </span>
          </div>

          <div className="relative h-10 flex items-center">
            {/* Waveform Visualization */}
            <div className="absolute inset-0 pointer-events-none">
              <WaveformProgress progress={progress} isHovering={isHovering} />
            </div>

            {/* Hidden Interactive Range Input */}
            <input
              type="range"
              min={0}
              max={displayDuration > 0 ? Math.floor(displayDuration) : 100}
              value={Math.floor(currentTime)}
              onChange={(e) => seek(Number(e.target.value))}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              disabled={!currentSong}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default z-10"
              aria-label="Progresso"
            />
          </div>
        </div>

        {/* ── Mobile layout: single compact row ── */}
        <div className="flex md:hidden h-14 items-center gap-3 px-3 pb-1">
          {currentSong ? (
            <>
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-md shadow-lg">
                <Image src={currentSong.thumbnail} alt={currentSong.title} fill className="object-cover" sizes="36px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white leading-tight">{currentSong.title}</p>
                <p className="truncate text-xs text-spotify-text">{currentSong.channel}</p>
              </div>
              <button
                onClick={togglePlay}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-black"
              >
                {isPlaying ? <HiPause className="h-5 w-5" /> : <HiPlay className="ml-0.5 h-5 w-5" />}
              </button>
            </>
          ) : (
            <p className="text-sm text-spotify-text px-1">Nenhuma música</p>
          )}
        </div>

        {/* ── Desktop layout: full 3-column row ── */}
        <div className="hidden md:flex h-[60px] items-center justify-between gap-4 px-4 pb-2">
          {/* Left: song info */}
          <div className="flex w-[28%] min-w-0 items-center gap-3">
            {currentSong ? (
              <>
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md shadow">
                  <Image src={currentSong.thumbnail} alt={currentSong.title} fill className="object-cover" sizes="40px" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{currentSong.title}</p>
                  <p className="truncate text-xs text-spotify-text">{currentSong.channel}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-spotify-text">Nenhuma música</p>
            )}
          </div>

          {/* Center: controls */}
          <div className="flex flex-1 items-center justify-center">
            <PlayerControls />
          </div>

          {/* Right: volume */}
          <div className="flex w-[28%] items-center justify-end gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 80 : 0)}
              className="text-spotify-text hover:text-white transition-colors"
            >
              {volume === 0 ? <HiVolumeOff className="h-5 w-5" /> : <HiVolumeUp className="h-5 w-5" />}
            </button>
            <input
              type="range" min={0} max={100} value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer accent-spotify-green"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </>
  )
}
