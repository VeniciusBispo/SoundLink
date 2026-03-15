'use client'

import {
  HiPlay,
  HiPause,
  HiFastForward,
  HiRewind,
  HiSwitchHorizontal,
  HiRefresh,
} from 'react-icons/hi'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/hooks/usePlayer'

export default function PlayerControls() {
  const {
    isPlaying,
    isShuffle,
    isLoading,
    togglePlay,
    next,
    previous,
    toggleShuffle,
    seekBackward,
    seekForward,
    replayFromStart,
  } = usePlayer()

  return (
    <div className="flex items-center gap-3">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={cn(
          'rounded-full p-1 transition-colors',
          isShuffle ? 'text-spotify-green' : 'text-spotify-text hover:text-white'
        )}
        title={isShuffle ? 'Aleatório ativado' : 'Aleatório desativado'}
      >
        <HiSwitchHorizontal className="h-4 w-4" />
      </button>

      {/* Replay from start */}
      <button
        onClick={replayFromStart}
        className="text-spotify-text hover:text-white transition-colors"
        title="Reiniciar música"
      >
        <HiRefresh className="h-4 w-4" />
      </button>

      {/* Seek -10s */}
      <button
        onClick={() => seekBackward(10)}
        className="text-spotify-text hover:text-white transition-colors text-xs font-bold leading-none"
        title="Voltar 10 segundos"
      >
        <span className="flex flex-col items-center gap-0">
          <HiRewind className="h-4 w-4" />
          <span className="text-[9px] leading-none">10s</span>
        </span>
      </button>

      {/* Previous */}
      <button
        onClick={previous}
        className="text-spotify-text hover:text-white transition-colors"
        title="Música anterior"
      >
        <HiRewind className="h-5 w-5" />
      </button>

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105',
          isLoading && 'opacity-60 cursor-not-allowed'
        )}
        title={isPlaying ? 'Pausar' : 'Reproduzir'}
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
        title="Próxima música"
      >
        <HiFastForward className="h-5 w-5" />
      </button>

      {/* Seek +10s */}
      <button
        onClick={() => seekForward(10)}
        className="text-spotify-text hover:text-white transition-colors"
        title="Avançar 10 segundos"
      >
        <span className="flex flex-col items-center gap-0">
          <HiFastForward className="h-4 w-4" />
          <span className="text-[9px] leading-none">10s</span>
        </span>
      </button>
    </div>
  )
}
