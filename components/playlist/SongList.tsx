'use client'

import { useState, useEffect } from 'react'
import type { PlaylistSong } from '@/types'
import { usePlayer } from '@/hooks/usePlayer'
import SongItem from './SongItem'

interface SongListProps {
  songs: PlaylistSong[]
  canEdit?: boolean
  onRemove?: (songId: string) => void
}

export default function SongList({ songs, canEdit, onRemove }: SongListProps) {
  const { playSong, currentSong, isPlaying, duration: liveDuration } = usePlayer()
  // Cache resolved durations for songs that have duration=0 in DB
  const [resolvedDurations, setResolvedDurations] = useState<Record<string, number>>({})

  const allSongs = songs.map((ps) => ps.song)

  // Fetch duration for songs stored with duration=0
  useEffect(() => {
    const missing = songs.filter((ps) => ps.song.duration === 0)
    if (!missing.length) return

    missing.forEach(async (ps) => {
      const { song } = ps
      if (resolvedDurations[song.id] !== undefined) return
      try {
        const res = await fetch(`/api/youtube?videoId=${encodeURIComponent(song.youtubeVideoId)}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.duration > 0) {
          setResolvedDurations((prev) => ({ ...prev, [song.id]: data.duration }))
        }
      } catch {
        // silent
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs])

  if (!songs.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-spotify-text">Nenhuma música nesta playlist ainda.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 pb-2">
      {songs.map((ps, index) => {
        const song = ps.song
        const isActive = currentSong?.id === song.id
        const duration = isActive && liveDuration > 0
            ? liveDuration
            : resolvedDurations[song.id] ?? song.duration

        return (
          <SongItem
            key={ps.songId || song.id}
            song={song}
            index={index}
            isActive={isActive}
            isPlaying={isPlaying}
            duration={duration}
            addedByUsername={ps.addedByUsername ?? undefined}
            canEdit={canEdit}
            onPlay={() => playSong(song, allSongs)}
            onRemove={onRemove ? () => onRemove(song.id) : undefined}
          />
        )
      })}
    </div>
  )
}

