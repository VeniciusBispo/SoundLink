'use client'

import Link from 'next/link'
import Image from 'next/image'
import { HiPlay, HiLockClosed } from 'react-icons/hi'
import type { Playlist } from '@/types'
import { usePlayer } from '@/hooks/usePlayer'
import { cn } from '@/lib/utils'

interface PlaylistCardProps {
  playlist: Playlist
  className?: string
}

export default function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  const { playPlaylist } = usePlayer()

  const songs = playlist.songs?.map((ps) => ps.song) ?? []

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    if (songs.length) playPlaylist(songs)
  }

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className={cn(
        'group relative flex flex-col gap-4 rounded-md bg-spotify-card p-4 transition-colors hover:bg-spotify-hover',
        className
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-square w-full overflow-hidden rounded shadow-lg">
        {playlist.coverImage ? (
          <Image
            src={playlist.coverImage}
            alt={playlist.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-spotify-hover">
            <span className="text-4xl">🎵</span>
          </div>
        )}

        {/* Play button overlay */}
        {songs.length > 0 && (
          <button
            onClick={handlePlay}
            className="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-spotify-green text-black opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105"
          >
            <HiPlay className="ml-1 h-6 w-6" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="truncate font-semibold text-white">{playlist.name}</p>
          {!playlist.isPublic && (
            <HiLockClosed className="mt-0.5 h-4 w-4 flex-shrink-0 text-spotify-text" />
          )}
        </div>
        {playlist.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-spotify-text">{playlist.description}</p>
        ) : (
          <p className="mt-1 text-sm text-spotify-text">
            {playlist.owner ? `By ${playlist.owner.username}` : 'Playlist'}
          </p>
        )}
      </div>
    </Link>
  )
}
