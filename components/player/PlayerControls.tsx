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
    toggleRepeat,
    repeatMode,
    playbackSpeed,
    setPlaybackSpeed,
    seekBackward,
    seekForward,
  } = usePlayer()

  const speeds = [1, 1.25, 1.5, 1.75, 2]
  const nextSpeed = () => {
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    setPlaybackSpeed(speeds[nextIndex])
  }

  return (
    <div className="flex items-center gap-3">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={cn(
          'rounded-full p-2 transition-all hover:scale-110 active:scale-90',
          isShuffle ? 'text-spotify-green' : 'text-spotify-text hover:text-white'
        )}
        title={isShuffle ? 'Aleatório ativado' : 'Aleatório desativado'}
      >
        <HiSwitchHorizontal className="h-5 w-5" />
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        className={cn(
          'relative rounded-full p-2 transition-all hover:scale-110 active:scale-90',
          repeatMode !== 'none' ? 'text-spotify-green' : 'text-spotify-text hover:text-white'
        )}
        title={
          repeatMode === 'all'
            ? 'Repetir tudo'
            : repeatMode === 'one'
            ? 'Repetir uma'
            : 'Não repetir'
        }
      >
        <HiRefresh className="h-5 w-5" />
        {repeatMode === 'one' && (
          <span className="absolute bottom-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-spotify-green text-[8px] font-bold text-black ring-1 ring-black">
            1
          </span>
        )}
      </button>

      {/* Playback Speed */}
      <button
        onClick={nextSpeed}
        className="text-[11px] font-extrabold text-spotify-text hover:text-white transition-all hover:scale-110 active:scale-90 w-10 text-center bg-white/5 rounded-md py-1"
        title="Velocidade de reprodução"
      >
        {playbackSpeed}x
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
          'flex h-12 w-12 items-center justify-center rounded-full bg-[#9a9ae6] text-white transition-all hover:scale-110 active:scale-95 shadow-lg shadow-[#9a9ae6]/20',
          isLoading && 'opacity-60 cursor-not-allowed'
        )}
        title={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? (
          <HiPause className="h-7 w-7" />
        ) : (
          <HiPlay className="ml-1 h-7 w-7" />
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
