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
  return <PlaylistGrid playlists={playlists} title="Playlists em destaque" />
}

export default function HomePage() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <MainLayout>
      <div className="py-4 md:py-6">
        <h1 className="mb-5 text-2xl font-extrabold text-white md:text-3xl">{greeting} 👋</h1>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-spotify-card" />
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
