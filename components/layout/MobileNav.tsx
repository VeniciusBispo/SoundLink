'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { HiHome, HiSearch, HiCollection, HiPlus, HiUser, HiViewList } from 'react-icons/hi'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const openCreatePlaylistModal = useUIStore((s) => s.openCreatePlaylistModal)

  const navItems = [
    { href: '/', icon: HiHome, label: 'Início', active: pathname === '/' },
    { href: '/explore', icon: HiSearch, label: 'Buscar', active: pathname === '/explore' },
    { href: '/songs', icon: HiCollection, label: 'Biblioteca', active: pathname === '/songs' },
  ]

  return (
    <nav className="md:hidden flex-shrink-0 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-lg border-t border-white/5 safe-area-bottom pb-2">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.active

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-16 transition-colors',
                isActive ? 'text-white' : 'text-spotify-text hover:text-white'
              )}
            >
              <div className="relative flex items-center justify-center h-8 w-8">
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="h-6 w-6 relative z-10" />
              </div>
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Action Button: Create Playlist or Go to Private */}
        {session && (
          <button
            onClick={openCreatePlaylistModal}
            className="flex flex-col items-center justify-center gap-1 w-16 text-spotify-text hover:text-white transition-colors"
          >
            <div className="relative flex items-center justify-center h-8 w-8">
              <HiPlus className="h-6 w-6 relative z-10" />
            </div>
            <span className="text-[10px] font-medium tracking-wide">Criar</span>
          </button>
        )}

        {/* Profile or Login */}
        <Link
          href={session ? '/profile' : '/login'}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-16 transition-colors',
            (pathname === '/profile' || pathname === '/login') ? 'text-white' : 'text-spotify-text hover:text-white'
          )}
        >
          <div className="relative flex items-center justify-center h-8 w-8">
            {(pathname === '/profile' || pathname === '/login') && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <HiUser className="h-6 w-6 relative z-10" />
          </div>
          <span className="text-[10px] font-medium tracking-wide">
            {session ? 'Perfil' : 'Entrar'}
          </span>
        </Link>
      </div>
    </nav>
  )
}
