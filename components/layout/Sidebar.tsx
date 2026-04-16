'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HiHome, HiSearch, HiMusicNote, HiPlus, HiChat, HiCollection, HiLockOpen, HiStar, HiBookOpen, HiMail } from 'react-icons/hi'
import { useMyPlaylists } from '@/hooks/usePlaylist'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'
import FeedbackModal from '@/components/ui/FeedbackModal'
import ThemeSwitcher from '@/components/theme/ThemeSwitcher'

const navItems = [
  { href: '/', label: 'Início', icon: HiHome },
  { href: '/explore', label: 'Explorar', icon: HiSearch },
  { href: '/blog', label: 'Blog', icon: HiBookOpen },
  { href: '/games/piano', label: 'Minijogos', icon: HiStar },
  { href: '/contato', label: 'Contato', icon: HiMail },
  { href: '/songs', label: 'Memória Musical', icon: HiCollection },
  { href: '/access', label: 'Playlist privada', icon: HiLockOpen },
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
      <nav className="rounded-xl bg-brand-dark p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all',
              pathname === href
                ? 'bg-brand-hover text-white'
                : 'text-brand-text hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', pathname === href && 'text-brand-primary')} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Library */}
      <div className="flex-1 overflow-hidden rounded-xl bg-brand-dark">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-text">
            <HiMusicNote className="h-5 w-5" />
            Sua Biblioteca
          </div>
          {session && (
            <button
              onClick={openCreatePlaylistModal}
              className="rounded-full p-1.5 text-brand-text hover:bg-brand-hover hover:text-white transition-colors"
              title="Criar playlist"
            >
              <HiPlus className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto px-2 pb-4" style={{ maxHeight: 'calc(100% - 56px)' }}>
          {!session ? (
            <div className="mx-1 rounded-xl bg-brand-card p-4">
              <p className="mb-1 text-sm font-bold text-white">Crie sua primeira playlist</p>
              <p className="mb-4 text-xs text-brand-text">É fácil, vamos te ajudar</p>
              <Link
                href="/login"
                className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black hover:scale-105 transition-transform inline-block"
              >
                Entrar
              </Link>
            </div>
          ) : playlists.length === 0 ? (
            <div className="mx-1 rounded-xl bg-brand-card p-4">
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
                    ? 'bg-brand-hover'
                    : 'hover:bg-white/5'
                )}
              >
                {playlist.coverImage ? (
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={playlist.coverImage}
                      alt={playlist.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-brand-primary/40 to-brand-card flex items-center justify-center shadow-md">
                    <HiMusicNote className="h-4 w-4 text-brand-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{playlist.name}</p>
                  <p className="truncate text-xs text-brand-text">
                    Playlist • {playlist._count?.songs ?? 0} músicas
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="px-1">
        <ThemeSwitcher />
      </div>

      {/* Feedback button */}
      <button
        onClick={() => setFeedbackOpen(true)}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-brand-text transition-colors hover:bg-white/5 hover:text-white"
      >
        <HiChat className="h-5 w-5 flex-shrink-0 text-brand-primary" />
        <span className="font-medium">Enviar feedback</span>
      </button>

      {session?.user?.role === 'ADMIN' && (
        <Link
          href="/admin"
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-brand-text transition-colors hover:bg-white/5 hover:text-white',
            pathname.startsWith('/admin') && 'text-white bg-brand-hover'
          )}
        >
          <HiCollection className="h-5 w-5 flex-shrink-0 text-brand-primary" />
          <span className="font-medium">Painel Admin</span>
        </Link>
      )}

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* Footer links */}
      <div className="mt-auto flex flex-col pt-4 border-t border-white/10">
        <Link
          href="/privacy"
          className="block px-3 py-1.5 text-xs text-brand-text/50 hover:text-brand-text transition-colors"
        >
          Política de Privacidade
        </Link>
        <Link
          href="/terms"
          className="block px-3 py-1.5 text-xs text-brand-text/50 hover:text-brand-text transition-colors"
        >
          Termos de Uso
        </Link>
      </div>
    </aside>
  )
}
