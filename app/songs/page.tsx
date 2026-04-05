'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { HiPlay, HiMusicNote, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import type { Song } from '@/types'
import { formatDuration } from '@/lib/utils'
import { usePlayer } from '@/hooks/usePlayer'
import MainLayout from '@/components/layout/MainLayout'
import AdBanner from '@/components/ads/AdBanner'

interface Meta {
  total: number
  page: number
  pages: number
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const { playSong, currentSong, isPlaying } = usePlayer()

  const fetchSongs = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/songs?page=${p}`)
      const json = await res.json()
      if (res.ok) {
        setSongs(json.data)
        setMeta(json.meta)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSongs(page)
  }, [page, fetchSongs])

  function handlePlay(song: Song, index: number) {
    playSong(song, songs)
  }

  return (
    <MainLayout>
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/30 to-brand-card md:h-48 md:w-48">
          <HiMusicNote className="h-16 w-16 text-brand-primary md:h-24 md:w-24" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-text">
            Descoberta
          </p>
          <h1 className="text-3xl font-extrabold text-white md:text-5xl">
            Memória Musical
          </h1>
          <p className="text-sm text-brand-text">
            Todas as músicas adicionadas nas playlists públicas do SoundLink
          </p>
          {!loading && (
            <p className="text-xs text-brand-text">{meta.total} músicas</p>
          )}
        </div>
      </div>

      {/* Ad — above song list */}
      <AdBanner slot="SLOT_SONGS_TOP" format="horizontal" className="rounded-xl" />

      {/* Song list */}
      <div className="flex flex-col">
        {/* Table header */}
        <div className="mb-2 grid grid-cols-[24px_1fr_1fr_72px] items-center gap-4 border-b border-white/10 px-4 pb-2 text-sm text-brand-text">
          <span>#</span>
          <span>Título</span>
          <span className="hidden md:block">Canal</span>
          <span className="text-right">Duração</span>
        </div>

        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[24px_1fr_1fr_72px] items-center gap-4 rounded-lg px-4 py-2.5"
            >
              <div className="h-4 w-4 animate-pulse rounded bg-brand-card" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded bg-brand-card" />
                <div className="h-4 w-40 animate-pulse rounded bg-brand-card" />
              </div>
              <div className="hidden h-4 w-28 animate-pulse rounded bg-brand-card md:block" />
              <div className="h-4 w-12 animate-pulse rounded bg-brand-card" />
            </div>
          ))
        ) : songs.length === 0 ? (
          <div className="py-16 text-center">
            <HiMusicNote className="mx-auto mb-4 h-16 w-16 text-brand-text/30" />
            <p className="text-brand-text">Nenhuma música encontrada ainda.</p>
            <p className="mt-1 text-sm text-brand-text/60">
              Músicas de playlists públicas aparecerão aqui.
            </p>
          </div>
        ) : (
          songs.map((song, index) => {
            const isActive = currentSong?.id === song.id
            return (
              <div
                key={song.id}
                className={`group grid grid-cols-[24px_1fr_1fr_72px] items-center gap-4 rounded-lg px-4 py-2 transition-colors hover:bg-white/5 ${isActive ? 'bg-white/10' : ''}`}
              >
                <button
                  onClick={() => handlePlay(song, index)}
                  className="flex items-center justify-center"
                >
                  <span className={`text-sm tabular-nums group-hover:hidden ${isActive ? 'text-brand-primary' : 'text-brand-text'}`}>
                    {isActive && isPlaying ? '▶' : index + 1 + (page - 1) * 50}
                  </span>
                  <HiPlay className="hidden h-4 w-4 text-white group-hover:block" />
                </button>

                <button
                  onClick={() => handlePlay(song, index)}
                  className="flex items-center gap-3 text-left min-w-0"
                >
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                    {song.thumbnail ? (
                      <Image
                        src={song.thumbnail}
                        alt={song.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-card">
                        <HiMusicNote className="h-5 w-5 text-brand-text" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${isActive ? 'text-brand-primary' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-brand-text md:hidden">{song.channel}</p>
                  </div>
                </button>

                <p className="hidden truncate text-sm text-brand-text md:block">
                  {song.channel}
                </p>

                <p className="text-right text-sm tabular-nums text-brand-text">
                  {formatDuration(song.duration)}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Ad — between list and pagination */}
      <AdBanner slot="SLOT_SONGS_BOTTOM" format="rectangle" className="mx-auto rounded-xl" />

      {/* Pagination */}
      {meta.pages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full p-2 text-brand-text transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <HiChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-brand-text">
            Página {page} de {meta.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            disabled={page === meta.pages}
            className="rounded-full p-2 text-brand-text transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <HiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
    </MainLayout>
  )
}
