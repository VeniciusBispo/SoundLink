'use client'

import { useState } from 'react'
import Image from 'next/image'
import { HiPlay, HiTrash } from 'react-icons/hi'
import type { PlaylistSong } from '@/types'
import { formatDuration } from '@/lib/utils'
import { usePlayer } from '@/hooks/usePlayer'
import { cn } from '@/lib/utils'

interface SongListProps {
  songs: PlaylistSong[]
  canEdit?: boolean
  onRemove?: (songId: string) => void
}

export default function SongList({ songs, canEdit, onRemove }: SongListProps) {
  const { playSong, currentSong, isPlaying } = usePlayer()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const allSongs = songs.map((ps) => ps.song)

  if (!songs.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-spotify-text">No songs in this playlist yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header row */}
      <div className="mb-2 grid grid-cols-[16px_1fr_1fr_80px] items-center gap-4 border-b border-white/10 px-4 pb-2 text-sm text-spotify-text">
        <span>#</span>
        <span>Title</span>
        <span className="hidden md:block">Channel</span>
        <span className="text-right">Duration</span>
      </div>

      {songs.map((ps, index) => {
        const song = ps.song
        const isActive = currentSong?.id === song.id
        const isHovered = hoveredIndex === index

        return (
          <div
            key={ps.songId}
            className={cn(
              'group grid grid-cols-[16px_1fr_1fr_80px] items-center gap-4 rounded-md px-4 py-2 transition-colors',
              isActive ? 'bg-white/10' : 'hover:bg-white/5'
            )}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Index / play indicator */}
            <div className="flex items-center justify-center">
              {isHovered ? (
                <button
                  onClick={() => playSong(song, allSongs)}
                  className="text-white"
                  aria-label={`Play ${song.title}`}
                >
                  <HiPlay className="h-4 w-4" />
                </button>
              ) : (
                <span className={cn('text-sm', isActive ? 'text-spotify-green' : 'text-spotify-text')}>
                  {isActive && isPlaying ? '▶' : index + 1}
                </span>
              )}
            </div>

            {/* Title + thumbnail */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={song.thumbnail}
                  alt={song.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    'truncate text-sm font-medium',
                    isActive ? 'text-spotify-green' : 'text-white'
                  )}
                >
                  {song.title}
                </p>
              </div>
            </div>

            {/* Channel */}
            <span className="hidden truncate text-sm text-spotify-text md:block">
              {song.channel}
            </span>

            {/* Duration + actions */}
            <div className="flex items-center justify-end gap-3">
              {canEdit && onRemove && (
                <button
                  onClick={() => onRemove(song.id)}
                  className="hidden text-spotify-text hover:text-red-400 transition-colors group-hover:block"
                  aria-label="Remove song"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              )}
              <span className="text-sm text-spotify-text">{formatDuration(song.duration)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
