'use client'

import React from 'react'
import Link from 'next/link'
import { HiStar, HiMusicNote, HiDuplicate, HiPuzzle, HiLightBulb } from 'react-icons/hi'

const ALL_GAMES = [
  {
    id: 'piano',
    emoji: '🎹',
    title: 'Piano Mágico',
    description: 'Toque um piano virtual e divirta-se criando melodias.',
    gradient: 'from-pink-600/30 to-rose-900/10',
    badge: 'Disponível',
    implemented: true,
  },

  {
    id: 'snake',
    emoji: '🐍',
    title: 'Cobrinha Musical',
    description: 'O clássico Snake com uma pegada rítmica.',
    gradient: 'from-green-600/30 to-teal-900/10',
    badge: 'Disponível',
    implemented: true,
  },
  {
    id: 'blind-test',
    emoji: '🎵',
    title: 'Blind Test',
    description: 'Adivinhe a música antes que o tempo acabe.',
    gradient: 'from-purple-600/30 to-purple-900/10',
    badge: 'Disponível',
    implemented: true,
  },
  {
    id: 'complete-lyrics',
    emoji: '✍️',
    title: 'Complete a Letra',
    description: 'Mostre que você conhece as letras dos grandes sucessos.',
    gradient: 'from-orange-600/30 to-red-900/10',
    badge: 'Disponível',
    implemented: true,
  },
]

export default function GamesIndexPage() {
  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2">Biblioteca de Jogos 🎮</h1>
        <p className="text-spotify-text">Divirta-se enquanto ouve suas músicas favoritas.</p>
      </div>

      {/* Mobile-only message */}
      <div className="md:hidden flex flex-col items-center justify-center py-20 px-8 text-center bg-spotify-card rounded-3xl border border-white/5">
        <div className="h-20 w-20 bg-spotify-green/10 rounded-full flex items-center justify-center mb-6">
          <HiPuzzle className="h-10 w-10 text-spotify-green" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4 italic uppercase">Experiência Desktop</h2>
        <p className="text-spotify-text font-medium leading-relaxed">
          Nossos mini jogos foram otimizados para uma experiência imersiva em telas maiores. 
          Acesse pelo seu computador para começar a jogar!
        </p>
      </div>

      <div className="hidden md:grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_GAMES.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-spotify-card p-6 border border-white/5 transition-all hover:scale-[1.03] hover:border-white/20 hover:bg-spotify-hover"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-20 group-hover:opacity-40 transition-opacity`} />
            
            <div className="relative z-10">
              <span className="text-5xl block mb-4 transform group-hover:scale-110 transition-transform">{game.emoji}</span>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-white">{game.title}</h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${game.implemented ? 'bg-spotify-green text-black' : 'bg-white/10 text-white/60'}`}>
                  {game.badge}
                </span>
              </div>
              <p className="text-sm text-spotify-text leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="relative z-10 mt-4 flex items-center text-xs font-bold text-white group-hover:text-spotify-green transition-colors">
              {game.implemented ? 'JOGAR AGORA' : 'VER DETALHES'}
              <HiStar className="ml-1 h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
