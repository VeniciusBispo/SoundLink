'use client'

import { useState } from 'react'
import PianoGame from './PianoGame'
import PianoTiles from './PianoTiles'
import { HiMusicNote, HiPuzzle } from 'react-icons/hi'
import { cn } from '@/lib/utils'

export default function PianoContainer() {
  const [mode, setMode] = useState<'free' | 'tiles' | null>(null)

  if (mode === 'free') {
    return (
      <div className="flex flex-col h-full">
        <button 
          onClick={() => setMode(null)}
          className="mb-4 text-xs text-spotify-text hover:text-white flex items-center gap-1"
        >
          ← Voltar ao menu do Piano
        </button>
        <PianoGame />
      </div>
    )
  }

  if (mode === 'tiles') {
    return (
      <div className="flex flex-col h-full">
        <button 
          onClick={() => setMode(null)}
          className="mb-4 text-xs text-spotify-text hover:text-white flex items-center gap-1"
        >
           ← Voltar ao menu do Piano
        </button>
        <PianoTiles />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-spotify-card to-[#090909] border border-white/5 p-8 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-spotify-green/5 blur-[120px] rounded-full pointer-events-none" />

      <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Piano Mágico 🎹</h2>
      <p className="text-spotify-text mb-12">Escolha como você quer tocar hoje</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl relative z-10">
        <button
          onClick={() => setMode('free')}
          className="group flex flex-col items-center gap-6 rounded-3xl bg-white/5 p-8 border border-white/10 hover:bg-white/10 hover:scale-[1.05] transition-all hover:border-spotify-green/30"
        >
          <div className="p-6 bg-spotify-green/10 rounded-2xl group-hover:bg-spotify-green/20 transition-colors">
            <HiMusicNote className="h-12 w-12 text-spotify-green" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Tocar Livre</h3>
            <p className="text-xs text-spotify-text">Use o seu teclado para praticar livremente como um instrumento real.</p>
          </div>
        </button>

        <button
          onClick={() => setMode('tiles')}
          className="group flex flex-col items-center gap-6 rounded-3xl bg-white/5 p-8 border border-white/10 hover:bg-white/10 hover:scale-[1.05] transition-all hover:border-spotify-green/30"
        >
          <div className="p-6 bg-spotify-green/10 rounded-2xl group-hover:bg-spotify-green/20 transition-colors">
            <HiPuzzle className="h-12 w-12 text-spotify-green" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Modo Desafio</h3>
            <p className="text-xs text-spotify-text">Acompanhe o ritmo das músicas acertando as teclas no momento certo.</p>
          </div>
          <div className="mt-auto px-3 py-1 bg-spotify-green text-black text-[10px] font-black rounded-full uppercase tracking-widest">
            Novo: Piano Tiles
          </div>
        </button>
      </div>
    </div>
  )
}
