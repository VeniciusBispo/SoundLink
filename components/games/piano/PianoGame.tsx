'use client'

import { usePianoStore } from '@/store/pianoStore'

export default function PianoGame() {
  const { isPlaying } = usePianoStore()

  const whiteKeys = Array.from({ length: 14 }) 
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-spotify-card to-[#121212] border border-white/5 p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 rounded-full bg-spotify-green/20 px-3 py-1 text-sm font-bold text-spotify-green tracking-wide">
        EM DESENVOLVIMENTO
      </div>
      
      <div className="relative mt-8 flex h-56 sm:h-64 w-full max-w-4xl rounded-t-lg bg-[#222] p-2 shadow-2xl">
        <div className="flex w-full gap-1 p-1 bg-black rounded-b overflow-hidden relative">
          
          <div className="flex w-full h-full gap-[2px]">
            {whiteKeys.map((_, i) => (
              <div 
                key={`white-${i}`} 
                className="flex-1 bg-white hover:bg-gray-200 cursor-pointer rounded-b shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] active:bg-gray-300 transition-colors"
                aria-label={`Tecla branca ${i + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-1 left-1 right-1 h-3/5 pointer-events-none flex" style={{ paddingLeft: '3.5%' }}>
             <div className="w-[5%] bg-black mx-[1%] shadow-lg rounded-b pointer-events-auto cursor-pointer hover:bg-gray-800" />
             <div className="w-[5%] bg-black mx-[1%] shadow-lg rounded-b pointer-events-auto cursor-pointer hover:bg-gray-800" />
             <div className="w-[7%] invisible mx-[1%]" />
             <div className="w-[5%] bg-black mx-[1%] shadow-lg rounded-b pointer-events-auto cursor-pointer hover:bg-gray-800" />
             <div className="w-[5%] bg-black mx-[1%] shadow-lg rounded-b pointer-events-auto cursor-pointer hover:bg-gray-800" />
             <div className="w-[5%] bg-black mx-[1%] shadow-lg rounded-b pointer-events-auto cursor-pointer hover:bg-gray-800" />
          </div>

        </div>
      </div>
      
      <p className="mt-8 text-center text-spotify-text max-w-lg leading-relaxed">
        A estrutura do jogo de piano já está preparada. Em breve você poderá conectar um teclado MIDI, jogar o modo "seguir a nota" ou apenas praticar livremente com seus amigos!
      </p>
    </div>
  )
}
