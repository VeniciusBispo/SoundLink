'use client'

import Link from 'next/link'
import Image from 'next/image'
import { HiPlay, HiLockClosed, HiMusicNote } from 'react-icons/hi'
import type { Playlist } from '@/types'
import { usePlayer } from '@/hooks/usePlayer'
import { cn } from '@/lib/utils'

interface PlaylistCardProps {
  playlist: Playlist
  className?: string
}

function isLikelyImageSrc(v: string) {
  return /^data:image\//.test(v) || /^https?:\/\//.test(v) || v.startsWith('/')
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
        'group relative flex flex-col gap-3 rounded-xl bg-spotify-card p-3 transition-all duration-200 hover:bg-spotify-hover hover:shadow-xl',
        className
      )}
    >
      {/* Cover image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
        {playlist.coverImage && isLikelyImageSrc(playlist.coverImage) ? (
          <Image
            src={playlist.coverImage}
            alt={playlist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
          />
        ) : playlist.coverImage ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-spotify-green/20 to-spotify-card">
            <span className="text-5xl">{playlist.coverImage}</span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-spotify-green/20 to-spotify-card">
            <HiMusicNote className="h-10 w-10 text-spotify-green/60" />
          </div>
        )}

        {/* Play button overlay */}
        {songs.length > 0 && (
          <button
            onClick={handlePlay}
            className="absolute bottom-2 right-2 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-spotify-green text-black opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
          >
            <HiPlay className="ml-0.5 h-5 w-5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="truncate text-sm font-bold text-white leading-tight">{playlist.name}</p>
          {!playlist.isPublic && (
            <HiLockClosed className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-spotify-text" />
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-spotify-text">
          {playlist.description ||
            (playlist.owner ? playlist.owner.username : 'Playlist')}
        </p>
      </div>
    </Link>
  )
}
