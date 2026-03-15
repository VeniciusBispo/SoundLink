'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HiHome, HiSearch, HiMusicNote, HiPlus, HiChat, HiCollection } from 'react-icons/hi'
import { useMyPlaylists } from '@/hooks/usePlaylist'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'
import FeedbackModal from '@/components/ui/FeedbackModal'

const navItems = [
  { href: '/', label: 'Home', icon: HiHome },
  { href: '/explore', label: 'Explorar', icon: HiSearch },
  { href: '/songs', label: 'Memória Musical', icon: HiCollection },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { playlists } = useMyPlaylists()
  const openCreatePlaylistModal = useUIStore((s) => s.openCreatePlaylistModal)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <aside className="flex h-full w-60 flex-col gap-2 bg-black p-2">
      {/* Logo */}
      <div className="px-3 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-xl font-extrabold tracking-tight text-white">SoundLink</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="rounded-xl bg-spotify-dark p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all',
              pathname === href
                ? 'bg-spotify-hover text-white'
                : 'text-spotify-text hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', pathname === href && 'text-spotify-green')} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Library */}
      <div className="flex-1 overflow-hidden rounded-xl bg-spotify-dark">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-spotify-text">
            <HiMusicNote className="h-5 w-5" />
            Sua Biblioteca
          </div>
          {session && (
            <button
              onClick={openCreatePlaylistModal}
              className="rounded-full p-1.5 text-spotify-text hover:bg-spotify-hover hover:text-white transition-colors"
              title="Criar playlist"
            >
              <HiPlus className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto px-2 pb-4" style={{ maxHeight: 'calc(100% - 56px)' }}>
          {!session ? (
            <div className="mx-1 rounded-xl bg-spotify-card p-4">
              <p className="mb-1 text-sm font-bold text-white">Crie sua primeira playlist</p>
              <p className="mb-4 text-xs text-spotify-text">É fácil, vamos te ajudar</p>
              <Link
                href="/login"
                className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black hover:scale-105 transition-transform inline-block"
              >
                Entrar
              </Link>
            </div>
          ) : playlists.length === 0 ? (
            <div className="mx-1 rounded-xl bg-spotify-card p-4">
              <p className="mb-1 text-sm font-bold text-white">Sem playlists ainda</p>
              <button
                onClick={openCreatePlaylistModal}
                className="mt-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black hover:scale-105 transition-transform"
              >
                Criar playlist
              </button>
            </div>
          ) : (
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-2 py-2.5 transition-all',
                  pathname === `/playlist/${playlist.id}`
                    ? 'bg-spotify-hover'
                    : 'hover:bg-white/5'
                )}
              >
                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-spotify-green/40 to-spotify-card flex items-center justify-center">
                  <HiMusicNote className="h-4 w-4 text-spotify-green" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{playlist.name}</p>
                  <p className="truncate text-xs text-spotify-text">
                    Playlist • {playlist._count?.songs ?? 0} músicas
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Feedback button */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-spotify-text transition-colors hover:bg-white/5 hover:text-white"
      >
        <HiChat className="h-5 w-5 flex-shrink-0 text-spotify-green" />
        <span className="font-medium">Enviar feedback</span>
      </button>

      {session?.user?.role === 'ADMIN' && (
        <Link
          href="/admin"
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-spotify-text transition-colors hover:bg-white/5 hover:text-white',
            pathname.startsWith('/admin') && 'text-white bg-spotify-hover'
          )}
        >
          <HiCollection className="h-5 w-5 flex-shrink-0 text-spotify-green" />
          <span className="font-medium">Painel Admin</span>
        </Link>
      )}

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </aside>
  )
}
