'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HiHome, HiSearch, HiMusicNote, HiUser, HiPlus, HiChat } from 'react-icons/hi'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const WA_FEEDBACK_URL =
  'https://wa.me/5579998278823?text=' +
  encodeURIComponent('Olá! Tenho um comentário/sugestão sobre o SoundLink:\n\n')

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const openCreatePlaylistModal = useUIStore((s) => s.openCreatePlaylistModal)

  return (
    <nav className="md:hidden flex-shrink-0 flex items-center justify-around border-t border-white/10 bg-[#0a0a0a] px-2 py-2 safe-area-bottom">
      <Link
        href="/"
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
          pathname === '/' ? 'text-white' : 'text-spotify-text'
        )}
      >
        <HiHome className="h-6 w-6" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      <Link
        href="/explore"
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
          pathname === '/explore' ? 'text-white' : 'text-spotify-text'
        )}
      >
        <HiSearch className="h-6 w-6" />
        <span className="text-[10px] font-medium">Explorar</span>
      </Link>

      {session && (
        <button
          onClick={openCreatePlaylistModal}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-spotify-text"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-spotify-green">
            <HiPlus className="h-4 w-4 text-black" />
          </div>
          <span className="text-[10px] font-medium">Nova</span>
        </button>
      )}

      <a
        href={WA_FEEDBACK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-0.5 px-3 py-1 text-spotify-text hover:text-white transition-colors"
      >
        <HiChat className="h-6 w-6" />
        <span className="text-[10px] font-medium">Feedback</span>
      </a>

      <Link
        href={session ? '/profile' : '/login'}
        className={cn(
          'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
          (pathname === '/profile' || pathname === '/login') ? 'text-white' : 'text-spotify-text'
        )}
      >
        {session ? <HiUser className="h-6 w-6" /> : <HiMusicNote className="h-6 w-6" />}
        <span className="text-[10px] font-medium">{session ? 'Perfil' : 'Entrar'}</span>
      </Link>
    </nav>
  )
}

