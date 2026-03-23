'use client'

import React from 'react'
import { HiStar } from 'react-icons/hi'

export default function SnakePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-spotify-card to-[#121212] border border-white/5 p-8 relative overflow-hidden text-center">
      <div className="absolute top-4 right-4 rounded-full bg-spotify-green/20 px-3 py-1 text-sm font-bold text-spotify-green tracking-wide">
        EM DESENVOLVIMENTO
      </div>
      
      <div className="p-12 bg-white/5 rounded-full mb-6">
        <HiStar className="h-16 w-16 text-spotify-green animate-bounce" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">Jogo da Cobrinha</h2>
      <p className="max-w-md text-spotify-text leading-relaxed">
        O clássico "Snake" está chegando ao SoundLink com uma pegada musical. Não deixe a cobrinha bater nas notas erradas!
      </p>
    </div>
  )
}
