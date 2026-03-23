'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import PianoContainer from '@/components/games/piano/PianoContainer'
import { HiPuzzle, HiArrowLeft } from 'react-icons/hi'
import Link from 'next/link'

export default function GamePage() {
  const params = useParams()
  const id = params.id as string

  // Logic to render specific game or placeholder
  if (id === 'piano') {
    return <PianoContainer />
  }

  // Placeholder for unimplemented games
  return (
    <div className="flex-1 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-spotify-card to-[#090909] border border-white/5 p-12 text-center relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-spotify-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-16 bg-white/5 rounded-full mb-8 border border-white/10">
        <HiPuzzle className="h-20 w-20 text-spotify-green animate-pulse" />
      </div>

      <div className="relative z-10 max-w-lg">
        <h2 className="text-4xl font-black text-white mb-4">Em Breve! 🚀</h2>
        <p className="text-lg text-spotify-text leading-relaxed mb-8">
          O jogo <span className="text-white font-bold capitalize">{id.replace(/-/g, ' ')}</span> está sendo preparado com muito carinho para você. Fique de olho nas atualizações!
        </p>
        
        <Link 
          href="/games"
          className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-black hover:scale-105 transition-transform"
        >
          <HiArrowLeft className="h-4 w-4" />
          Voltar para Biblioteca
        </Link>
      </div>
    </div>
  )
}
