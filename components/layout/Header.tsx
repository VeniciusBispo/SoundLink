'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { HiUser, HiLogout } from 'react-icons/hi'
import SearchBar from '@/components/ui/SearchBar'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between gap-4 px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>

      {/* Auth actions */}
      <div className="flex items-center gap-3">
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
              <span className="hidden sm:inline">{session.user.username}</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="rounded-full p-2 text-spotify-text hover:bg-spotify-hover hover:text-white transition-colors"
              title="Sign out"
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
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black hover:scale-105 transition-transform"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
