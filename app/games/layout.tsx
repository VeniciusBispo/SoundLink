'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import GameAdManager from '@/components/games/GameAdManager'
import { HiMusicNote, HiDuplicate, HiStar, HiX } from 'react-icons/hi'
import { cn } from '@/lib/utils'

const games = [
  { id: 'piano', label: 'Piano Mágico', icon: HiMusicNote, href: '/games/piano' },
  { id: 'memory', label: 'Jogo da Memória', icon: HiDuplicate, href: '/games/memory' },
  { id: 'snake', label: 'Cobrinha', icon: HiStar, href: '/games/snake' },
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
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap lg:whitespace-normal',
                      pathname === game.href
                        ? 'bg-spotify-green text-black'
                        : 'bg-white/5 text-spotify-text hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <game.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{game.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Banner Vertical lateral no desktop */}
            <div className="hidden lg:block flex-1 rounded-2xl bg-white/5 border border-white/5 overflow-hidden min-h-[400px]">
               <div className="flex items-center justify-center h-full italic text-xs text-white/10">
                  {/* Espaço para Banner 160x600 opcional */}
                  Publicidade Lateral
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
