'use client'

import {
  HiPlay,
  HiPause,
  HiSkipForward,
  HiSkipBackward,
  HiSwitchHorizontal,
} from 'react-icons/hi'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/hooks/usePlayer'

export default function PlayerControls() {
  const { isPlaying, isShuffle, isLoading, togglePlay, next, previous, toggleShuffle } =
    usePlayer()

  return (
    <div className="flex items-center gap-4">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={cn(
          'rounded-full p-1 transition-colors',
          isShuffle ? 'text-spotify-green' : 'text-spotify-text hover:text-white'
        )}
        title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
      >
        <HiSwitchHorizontal className="h-5 w-5" />
      </button>

      {/* Previous */}
      <button
        onClick={previous}
        className="text-spotify-text hover:text-white transition-colors"
        title="Previous"
      >
        <HiSkipBackward className="h-6 w-6" />
      </button>

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105',
          isLoading && 'opacity-60 cursor-not-allowed'
        )}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <HiPause className="h-5 w-5" />
        ) : (
          <HiPlay className="ml-0.5 h-5 w-5" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={next}
        className="text-spotify-text hover:text-white transition-colors"
        title="Next"
      >
        <HiSkipForward className="h-6 w-6" />
      </button>
    </div>
  )
}
