import { Suspense } from 'react'
import { getPublicPlaylists } from '@/services/playlistService'
import MainLayout from '@/components/layout/MainLayout'
import PlaylistGrid from '@/components/playlist/PlaylistGrid'
import type { Playlist } from '@/types'

async function FeaturedPlaylists() {
  let playlists: Playlist[] = []
  try {
    const result = await getPublicPlaylists(1, 12)
    playlists = result.data
  } catch {
    // gracefully degrade
  }
  return <PlaylistGrid playlists={playlists} title="Featured Playlists" />
}

export default function HomePage() {
  return (
    <MainLayout>
      <div className="py-6">
        <h1 className="mb-6 text-3xl font-bold text-white">Good evening</h1>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-md bg-spotify-card" />
              ))}
            </div>
          }
        >
          <FeaturedPlaylists />
        </Suspense>
      </div>
    </MainLayout>
  )
}
