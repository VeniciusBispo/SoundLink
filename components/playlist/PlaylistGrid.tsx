import type { Playlist } from '@/types'
import PlaylistCard from './PlaylistCard'

interface PlaylistGridProps {
  playlists: Playlist[]
  title?: string
}

export default function PlaylistGrid({ playlists, title }: PlaylistGridProps) {
  if (!playlists.length) {
    return (
      <div className="py-8 text-center text-spotify-text">
        <p>No playlists found.</p>
      </div>
    )
  }

  return (
    <section>
      {title && (
        <h2 className="mb-5 text-2xl font-bold text-white">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </section>
  )
}
