'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { HiVolumeUp, HiVolumeOff } from 'react-icons/hi'
import { usePlayer } from '@/hooks/usePlayer'
import { formatDuration } from '@/lib/utils'
import PlayerControls from './PlayerControls'

const YouTubePlayer = dynamic(() => import('./YouTubePlayer'), { ssr: false })

export default function PlayerBar() {
  const { currentSong, volume, setVolume, currentTime, duration, seek } = usePlayer()

  const displayDuration = duration > 0 ? duration : (currentSong?.duration ?? 0)
  const progress = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0

  return (
    <>
      {/* Hidden YouTube IFrame player – always mounted so the API is ready */}
      <YouTubePlayer />

      <div className="flex flex-shrink-0 flex-col border-t border-white/10 bg-spotify-dark">
        {/* ── Progress bar row ── */}
        <div className="flex items-center gap-2 px-4 pt-2">
          <span className="w-10 text-right text-xs text-spotify-text tabular-nums select-none">
            {formatDuration(Math.floor(currentTime))}
          </span>
          <div className="relative flex-1 group">
            <input
              type="range"
              min={0}
              max={displayDuration > 0 ? Math.floor(displayDuration) : 100}
              value={Math.floor(currentTime)}
              onChange={(e) => seek(Number(e.target.value))}
              disabled={!currentSong}
              className="seek-bar w-full cursor-pointer disabled:cursor-default"
              style={{
                background: `linear-gradient(to right, #1DB954 ${progress}%, #4d4d4d ${progress}%)`,
              }}
              aria-label="Progresso"
            />
          </div>
          <span className="w-10 text-xs text-spotify-text tabular-nums select-none">
            {formatDuration(Math.floor(displayDuration))}
          </span>
        </div>

        {/* ── Main row: song info / controls / volume ── */}
        <div className="flex h-[68px] items-center justify-between gap-4 px-4 pb-2">
          {/* Left: current song info */}
          <div className="flex w-[30%] min-w-0 items-center gap-3">
            {currentSong ? (
              <>
                <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={currentSong.thumbnail}
                    alt={currentSong.title}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {currentSong.title}
                  </p>
                  <p className="truncate text-xs text-spotify-text">
                    {currentSong.channel}
                  </p>
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
          <div className="flex w-[30%] items-center justify-end gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 80 : 0)}
              className="text-spotify-text hover:text-white transition-colors"
              title={volume === 0 ? 'Ativar som' : 'Mudo'}
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
      </div>
    </>
  )
}
