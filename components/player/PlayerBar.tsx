'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { HiVolumeUp, HiVolumeOff, HiPlay, HiPause } from 'react-icons/hi'
import { usePlayer } from '@/hooks/usePlayer'
import { formatDuration } from '@/lib/utils'
import PlayerControls from './PlayerControls'
import WaveformProgress from './WaveformProgress'
import FullScreenPlayer from './FullScreenPlayer'

export default function PlayerBar() {
  const { currentSong, volume, setVolume, currentTime, duration, seek, isPlaying, togglePlay } = usePlayer()
  const [isHovering, setIsHovering] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const displayDuration = duration > 0 ? duration : (currentSong?.duration ?? 0)
  const progress = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0

  return (
    <>
      <FullScreenPlayer isOpen={isFullScreen} onClose={() => setIsFullScreen(false)} />

      {currentSong && (
      <div className="flex flex-shrink-0 flex-col border-t border-white/5 bg-[#121212]/95 backdrop-blur-md safe-area-bottom z-40 relative">
        
        {/* Mobile Progress Line */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-[2px] bg-white/10 z-50">
           {currentSong && (
             <div 
               className="h-full bg-white transition-all duration-200 ease-linear rounded-r-full"
               style={{ width: `${progress}%` }}
             />
           )}
        </div>

        {/* Desktop Progress bar */}
        <div className="hidden md:block relative group px-6 pt-2 pb-1">
          <div className="relative h-6 flex items-center">
            <div className="absolute inset-0 pointer-events-none">
              <WaveformProgress progress={progress} isHovering={isHovering} />
            </div>
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

        {/* ── Mobile layout: compact mini player ── */}
        <div 
          className="flex md:hidden h-[60px] items-center justify-between px-3 cursor-pointer relative"
          onClick={() => {
            if (currentSong) setIsFullScreen(true)
          }}
        >
          {currentSong ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded shadow-sm">
                  <Image src={currentSong.thumbnail} alt={currentSong.title} fill className="object-cover" sizes="40px" />
                </div>
                <div className="min-w-0 pr-2 pb-0.5">
                  <p className="truncate text-sm font-semibold text-white leading-tight mb-0.5">{currentSong.title}</p>
                  <p className="truncate text-[12px] text-spotify-text leading-none">{currentSong.channel}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center text-white p-2 mr-1"
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
              >
                {isPlaying ? <HiPause className="h-7 w-7" /> : <HiPlay className="h-7 w-7 ml-0.5" />}
              </button>
            </>
          ) : (
            <p className="text-sm font-medium text-spotify-text px-2">Nenhuma música tocando</p>
          )}
        </div>

        {/* ── Desktop layout ── */}
        <div className="hidden md:flex h-[72px] items-center justify-between gap-4 px-4 pb-2">
          {/* Left: song info */}
          <div className="flex w-[30%] min-w-0 items-center gap-3">
            {currentSong ? (
              <>
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded shadow">
                  <Image src={currentSong.thumbnail} alt={currentSong.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <p className="truncate text-[14px] hover:underline cursor-pointer font-bold text-white mb-0.5">{currentSong.title}</p>
                  <p className="truncate text-[12px] hover:underline cursor-pointer text-spotify-text">{currentSong.channel}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-spotify-text font-medium">Nenhuma música tocando</p>
            )}
          </div>

          {/* Center: controls */}
          <div className="flex flex-1 items-center justify-center">
            <PlayerControls />
          </div>

          {/* Right: volume & duration */}
          <div className="flex w-[30%] items-center justify-end gap-3 pr-2">
             <div className="text-[12px] text-spotify-text/80 font-medium tabular-nums mr-2 tracking-wide">
                {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(displayDuration))}
             </div>
            <button
              onClick={() => setVolume(volume === 0 ? 80 : 0)}
              className="text-spotify-text hover:text-white transition-colors p-1"
            >
              {volume === 0 ? <HiVolumeOff className="h-[20px] w-[20px]" /> : <HiVolumeUp className="h-[20px] w-[20px]" />}
            </button>
            <input
              type="range" min={0} max={100} value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-24 cursor-pointer accent-white hover:accent-spotify-green transition-colors bg-white/20 rounded-full"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
      )}
    </>
  )
}
