'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { HiUser, HiLogout } from 'react-icons/hi'
import SearchBar from '@/components/ui/SearchBar'
import Logo from '@/components/ui/Logo'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="flex flex-shrink-0 flex-col gap-2 px-4 py-3 md:flex-row md:h-16 md:items-center md:justify-between md:gap-4 md:px-6 md:py-0">
      {/* Mobile: logo row */}
      <div className="flex items-center justify-between md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={30} />
          <span className="text-lg font-extrabold tracking-tight text-white">SoundLink</span>
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-full bg-spotify-card px-2.5 py-1.5 text-xs font-semibold text-white"
              >
                <HiUser className="h-4 w-4" />
                <span className="max-w-[80px] truncate">{session.user.username}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="rounded-full p-2 text-spotify-text hover:text-white"
                title="Sair"
              >
                <HiLogout className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-spotify-green px-4 py-1.5 text-xs font-bold text-black"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* Search bar — full width on mobile, max-w on desktop */}
      <div className="w-full md:flex-1 md:max-w-md">
        <SearchBar />
      </div>

      {/* Desktop auth actions */}
      <div className="hidden md:flex items-center gap-3">
        {session ? (
          <>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full bg-spotify-card px-3 py-1.5 text-sm font-semibold text-white hover:bg-spotify-hover transition-colors"
            >
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.username}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <HiUser className="h-5 w-5" />
              )}
              <span>{session.user.username}</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="rounded-full p-2 text-spotify-text hover:bg-spotify-hover hover:text-white transition-colors"
              title="Sair"
            >
              <HiLogout className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-semibold text-spotify-text hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black hover:scale-105 transition-transform"
            >
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
