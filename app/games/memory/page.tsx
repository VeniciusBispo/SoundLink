'use client'

import React from 'react'
import { HiDuplicate } from 'react-icons/hi'

export default function MemoryPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-spotify-card to-[#121212] border border-white/5 p-8 relative overflow-hidden text-center">
      <div className="absolute top-4 right-4 rounded-full bg-spotify-green/20 px-3 py-1 text-sm font-bold text-spotify-green tracking-wide">
        EM DESENVOLVIMENTO
      </div>
      
      <div className="p-12 bg-white/5 rounded-full mb-6">
        <HiDuplicate className="h-16 w-16 text-spotify-green animate-pulse" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-4">Jogo da Memória</h2>
      <p className="max-w-md text-spotify-text leading-relaxed">
        Prepare-se para testar sua mente! Em breve você poderá desafiar seus amigos neste clássico jogo de memória com álbuns e artistas do SoundLink.
      </p>
    </div>
  )
}
