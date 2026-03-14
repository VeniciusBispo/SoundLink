'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HiHome, HiSearch, HiMusicNote, HiPlus } from 'react-icons/hi'
import { useMyPlaylists } from '@/hooks/usePlaylist'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: HiHome },
  { href: '/explore', label: 'Explore', icon: HiSearch },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { playlists } = useMyPlaylists()
  const openCreatePlaylistModal = useUIStore((s) => s.openCreatePlaylistModal)

  return (
    <aside className="flex h-full w-60 flex-col gap-2 bg-black p-2">
      {/* Logo */}
      <div className="px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <HiMusicNote className="h-8 w-8 text-spotify-green" />
          <span className="text-xl font-bold text-white">SoundLink</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="rounded-lg bg-spotify-dark p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-4 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
              pathname === href
                ? 'text-white'
                : 'text-spotify-text hover:text-white'
            )}
          >
            <Icon className="h-6 w-6" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Library */}
      <div className="flex-1 overflow-hidden rounded-lg bg-spotify-dark">
        <div className="flex items-center justify-between px-4 py-4">
          <button className="flex items-center gap-2 text-sm font-semibold text-spotify-text hover:text-white transition-colors">
            <HiMusicNote className="h-5 w-5" />
            Your Library
          </button>
          {session && (
            <button
              onClick={openCreatePlaylistModal}
              className="rounded-full p-1 text-spotify-text hover:bg-spotify-hover hover:text-white transition-colors"
              title="Create playlist"
            >
              <HiPlus className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Playlist list */}
        <div className="overflow-y-auto px-2 pb-4" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {!session ? (
            <div className="mx-2 rounded-lg bg-spotify-card p-4">
              <p className="mb-3 text-sm font-semibold text-white">Create your first playlist</p>
              <p className="mb-4 text-xs text-spotify-text">It&apos;s easy, we&apos;ll help you</p>
              <Link
                href="/login"
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:scale-105 transition-transform inline-block"
              >
                Log in
              </Link>
            </div>
          ) : playlists.length === 0 ? (
            <p className="px-2 text-xs text-spotify-text">No playlists yet</p>
          ) : (
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 transition-colors',
                  pathname === `/playlist/${playlist.id}`
                    ? 'bg-spotify-hover'
                    : 'hover:bg-spotify-hover'
                )}
              >
                <div className="h-10 w-10 flex-shrink-0 rounded bg-spotify-card" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{playlist.name}</p>
                  <p className="truncate text-xs text-spotify-text">
                    Playlist • {playlist._count?.songs ?? 0} songs
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}
