'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HiHome, HiSearch, HiUser, HiPlus, HiChat, HiCollection, HiLockOpen } from 'react-icons/hi'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import FeedbackModal from '@/components/ui/FeedbackModal'

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const openCreatePlaylistModal = useUIStore((s) => s.openCreatePlaylistModal)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <nav className="md:hidden flex-shrink-0 border-t border-white/10 bg-[#0a0a0a] safe-area-bottom">
      <div className="flex items-center overflow-x-auto scrollbar-hide px-1 py-2">
      <Link
        href="/"
        className={cn(
          'flex min-h-[44px] flex-shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
          pathname === '/' ? 'text-white' : 'text-spotify-text'
        )}
      >
        <HiHome className="h-6 w-6" />
        <span className="text-[10px] font-medium">Início</span>
      </Link>

      <Link
        href="/explore"
        className={cn(
          'flex min-h-[44px] flex-shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
          pathname === '/explore' ? 'text-white' : 'text-spotify-text'
        )}
      >
        <HiSearch className="h-6 w-6" />
        <span className="text-[10px] font-medium">Explorar</span>
      </Link>

      <Link
        href="/songs"
        className={cn(
          'flex min-h-[44px] flex-shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
          pathname === '/songs' ? 'text-white' : 'text-spotify-text'
        )}
      >
        <HiCollection className="h-6 w-6" />
        <span className="text-[10px] font-medium">Músicas</span>
      </Link>

      <Link
        href="/access"
        className={cn(
          'flex min-h-[44px] flex-shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
          pathname === '/access' ? 'text-white' : 'text-spotify-text'
        )}
      >
        <HiLockOpen className="h-6 w-6" />
        <span className="text-[10px] font-medium">Privada</span>
      </Link>

      {session && (
        <button
          onClick={openCreatePlaylistModal}
          className="flex min-h-[44px] flex-shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 px-3 py-2 text-spotify-text"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-spotify-green">
            <HiPlus className="h-4 w-4 text-black" />
          </div>
          <span className="text-[10px] font-medium">Nova</span>
        </button>
      )}

      <button
        onClick={() => setFeedbackOpen(true)}
        className="flex min-h-[44px] flex-shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 px-3 py-2 text-spotify-text hover:text-white transition-colors"
      >
        <HiChat className="h-6 w-6" />
        <span className="text-[10px] font-medium">Sugestões</span>
      </button>

      {session?.user?.role === 'ADMIN' && (
        <Link
          href="/admin"
          className={cn(
            'flex flex-shrink-0 flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
            pathname.startsWith('/admin') ? 'text-spotify-green' : 'text-spotify-text'
          )}
        >
          <HiCollection className="h-6 w-6" />
          <span className="text-[10px] font-medium">Admin</span>
        </Link>
      )}

      <Link
        href={session ? '/profile' : '/login'}
        className={cn(
          'flex min-h-[44px] flex-shrink-0 touch-manipulation flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-colors',
          (pathname === '/profile' || pathname === '/login') ? 'text-white' : 'text-spotify-text'
        )}
      >
        <HiUser className="h-6 w-6" />
        <span className="text-[10px] font-medium">{session ? 'Perfil' : 'Entrar'}</span>
      </Link>
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </nav>
  )
}

