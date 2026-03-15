'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import PlaylistGrid from '@/components/playlist/PlaylistGrid'
import AdBanner from '@/components/ads/AdBanner'
import type { Playlist } from '@/types'
import { getPublicPlaylists } from '@/services/playlistService'

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 24

  useEffect(() => {
    setIsLoading(true)
    getPublicPlaylists(page, pageSize)
      .then((res) => {
        setPlaylists(res.data)
        setTotal(res.total)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [page])

  const filtered = query
    ? playlists.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase())
      )
    : playlists

  return (
    <MainLayout>
      <div className="py-6">
        <h1 className="mb-2 text-3xl font-bold text-white">
          {query ? `Results for "${query}"` : 'Explore'}
        </h1>
        <p className="mb-6 text-sm text-spotify-text">{total} public playlists</p>

        {/* Ad — top of explore */}
        <AdBanner slot="SLOT_EXPLORE_TOP" format="horizontal" className="mb-6 rounded-xl" />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-square animate-pulse rounded-md bg-spotify-card" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-spotify-card" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-spotify-card" />
              </div>
            ))}
          </div>
        ) : (
          <PlaylistGrid playlists={filtered} />
        )}

        {/* Ad — below grid */}
        {!isLoading && (
          <AdBanner slot="SLOT_EXPLORE_BOTTOM" format="horizontal" className="mt-8 rounded-xl" />
        )}

        {/* Pagination */}
        {!isLoading && total > pageSize && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full bg-spotify-card px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-spotify-hover transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-spotify-text">
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="rounded-full bg-spotify-card px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-spotify-hover transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
