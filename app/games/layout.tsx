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

  const isGameIndex = pathname === '/games'

  return (
    <MainLayout>
      <div className="flex flex-col h-full py-2 sm:py-4 overflow-hidden">
        {/* Ad Management Layer */}
        <GameAdManager />

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 overflow-hidden">
          {/* Game Switcher Sidebar - Hidden on mobile if a game is active */}
          <div className={cn(
            "lg:w-64 flex-shrink-0 flex flex-col gap-4",
            !isGameIndex && "hidden lg:flex"
          )}>
            <div className="rounded-2xl bg-brand-dark p-4 border border-white/5">
              <h2 className="text-white font-bold mb-4 px-2">Outros Jogos</h2>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                {games.map((game) => (
                  <Link
                    key={game.id}
                    href={game.href}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap lg:whitespace-normal group',
                      pathname === game.href
                        ? 'bg-brand-primary text-black'
                        : 'bg-white/5 text-brand-text hover:bg-white/10 hover:text-white'
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
                          : (game.badge === 'Novo' ? "bg-brand-primary/20 text-brand-primary" : "bg-white/10 text-white/40")
                      )}>
                        {game.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Back button on mobile when sidebar is hidden */}
          {!isGameIndex && (
            <div className="lg:hidden px-4 mb-2">
              <Link 
                href="/games"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text hover:text-white flex items-center gap-2"
              >
                <span>←</span> Voltar para Jogos
              </Link>
            </div>
          )}

          {/* Game Canvas / Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
             {/* Desktop Content */}
             <div className="hidden md:flex flex-col h-full">
                {children}
             </div>

             {/* Mobile-only Restriction Message */}
             <div className="md:hidden flex-1 flex flex-col items-center justify-center py-10 px-6 text-center bg-brand-dark/50 rounded-2xl border border-white/5 mx-2">
                <div className="h-16 w-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                  <HiPuzzle className="h-8 w-8 text-brand-primary" />
                </div>
                <h2 className="text-xl font-black text-white mb-3 italic uppercase text-balance">Jogo não disponível em celular</h2>
                <p className="text-brand-text text-sm font-medium leading-relaxed text-balance">
                  Mini jogos exigem controles precisos e tela ampla. 
                  Por favor, use um computador para jogar {pathname.split('/').pop()?.replace('-', ' ')}.
                </p>
                <Link 
                  href="/games"
                  className="mt-8 px-6 py-2 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest transition-transform hover:scale-105"
                >
                  Ver todos os jogos
                </Link>
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
