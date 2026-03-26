'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import GameAdManager from '@/components/games/GameAdManager'
import { HiMusicNote, HiDuplicate, HiStar, HiPencilAlt, HiUsers, HiRss, HiPuzzle } from 'react-icons/hi'
import { cn } from '@/lib/utils'

const games = [
  { id: 'blind-test', label: 'Blind Test', icon: HiMusicNote, href: '/games/blind-test', badge: 'Novo' },
  { id: 'complete-lyrics', label: 'Complete a Letra', icon: HiPencilAlt, href: '/games/complete-lyrics', badge: 'Novo' },

  { id: 'snake', label: 'Cobrinha', icon: HiPuzzle, href: '/games/snake', badge: 'Novo' },
  { id: 'radar', label: 'Radar Musical', icon: HiRss, href: '/games/radar', badge: 'Novo' },
  { id: 'piano', label: 'Piano', icon: HiMusicNote, href: '/games/piano', badge: 'Novo' },
]

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <MainLayout>
      <div className="flex flex-col h-full py-4">
        {/* Ad Management Layer */}
        <GameAdManager />

        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
          {/* Game Switcher Sidebar */}
          <div className="lg:w-64 flex-shrink-0 flex flex-col gap-4">
            <div className="rounded-2xl bg-spotify-dark p-4 border border-white/5">
              <h2 className="text-white font-bold mb-4 px-2">Outros Jogos</h2>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                {games.map((game) => (
                  <Link
                    key={game.id}
                    href={game.href}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap lg:whitespace-normal group',
                      pathname === game.href
                        ? 'bg-spotify-green text-black'
                        : 'bg-white/5 text-spotify-text hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <game.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{game.label}</span>
                    </div>
                    {game.badge && (
                      <span className={cn(
                        "text-[9px] uppercase tracking-tighter px-1.5 py-0.5 rounded-md font-bold",
                        pathname === game.href
                          ? "bg-black/20 text-black"
                          : (game.badge === 'Novo' ? "bg-spotify-green/20 text-spotify-green" : "bg-white/10 text-white/40")
                      )}>
                        {game.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Game Canvas / Content */}
          <div className="flex-1 flex flex-col min-h-0">
             {children}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
