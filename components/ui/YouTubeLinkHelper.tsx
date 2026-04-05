'use client'

import { useState } from 'react'
import { HiInformationCircle, HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

interface YouTubeLinkHelperProps {
  mode: 'song' | 'playlist'
}

export default function YouTubeLinkHelper({ mode }: YouTubeLinkHelperProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isSong = mode === 'song'

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm text-brand-text transition-colors hover:bg-white/5 hover:text-white"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 font-medium">
          <HiInformationCircle className="h-5 w-5 text-brand-primary" />
          <span>Como copiar o link {isSong ? 'da música' : 'da playlist'}?</span>
        </div>
        {isExpanded ? (
          <HiChevronUp className="h-5 w-5 text-white" />
        ) : (
          <HiChevronDown className="h-5 w-5" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="border-t border-white/5 px-4 pb-4 pt-3">
              <div className="flex flex-col gap-4">
                <div className="text-xs text-brand-text space-y-2">
                  <p>
                    <strong>Passo 1:</strong> Abra {isSong ? 'o vídeo da música no YouTube' : 'a playlist no YouTube Music'}.
                  </p>
                  <p>
                    <strong>Passo 2:</strong> Clique no botão <strong>Compartilhar</strong> (Share).
                  </p>
                  <p>
                    <strong>Passo 3:</strong> Selecione <strong>Copiar link</strong>.
                  </p>
                  {!isSong && (
                    <p className="mt-2 text-[10px] text-yellow-500/80 italic">
                      Nota: Playlists automáticas (Mix ou Rádio) e playlists privadas não podem ser importadas.
                    </p>
                  )}
                </div>

                {/* GIF Container */}
                <div className="relative w-full overflow-hidden rounded-lg border border-white/5 bg-black/40">
                  <img
                    src={isSong
                      ? "/images/tutorial-song.gif"
                      : "/images/tutorial-playlist.gif"}
                    alt={`Tutorial de como copiar link de ${isSong ? 'música' : 'playlist'}`}
                    className="w-full h-auto object-contain opacity-90"
                  />

                  {/* Overlay text for development context */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/80 p-4 text-center">
                    <p className="text-[10px] text-white/70">
                      (Substitua o src da Image no componente YouTubeLinkHelper.tsx pelo seu GIF instrucional)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
