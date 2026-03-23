'use client'

import { useEffect, useState } from 'react'
import AdZone from '../ads/AdZone'
import { HiX } from 'react-icons/hi'

/**
 * GameAdManager Component
 * Handles:
 * 1. Initial entry ad (Modal or Banner)
 * 2. Recurring ads every 5 minutes
 */
export default function GameAdManager() {
  const [showTimedAd, setShowTimedAd] = useState(false)
  const [lastAdTime, setLastAdTime] = useState(Date.now())

  useEffect(() => {
    // Anúncio ao entrar no jogo (1 segundo após carregar)
    const entryTimer = setTimeout(() => {
      setShowTimedAd(true)
    }, 1000)

    // Timer para anúncio a cada 5 minutos (300.000 ms)
    const interval = setInterval(() => {
      setShowTimedAd(true)
      setLastAdTime(Date.now())
    }, 300000) 

    return () => {
      clearTimeout(entryTimer)
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      {/* Banner fixo no topo do jogo (Sempre visível) */}
      <div className="mb-4 w-full">
        <AdZone 
          zoneKey="861d749601dfaf98fb0e62a9bee365bc" 
          mobileZoneKey="5acb4ba8ffe25a92c59c05d76b637e2f"
          format="728x90" 
          className="opacity-100" 
        />
      </div>

      {/* Modal de anúncio recorrente (5 min) */}
      {showTimedAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-spotify-dark p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowTimedAd(false)}
              className="absolute -top-2 -right-2 rounded-full bg-white p-1.5 text-black hover:scale-110 transition-transform shadow-lg"
            >
              <HiX className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white">Pausa para Publicidade</h3>
              <p className="text-sm text-spotify-text">O jogo continuará em instantes...</p>
            </div>

            <div className="flex items-center justify-center min-h-[250px] bg-black/20 rounded-xl border border-white/5">
              {/* Usando o formato 300x250 (Retângulo) para o modal */}
              <AdZone 
                zoneKey="dc57c85466356ba2785c2f13c18849a1" 
                format="300x250" 
              />
            </div>

            <button 
              onClick={() => setShowTimedAd(false)}
              className="mt-6 w-full rounded-full bg-white py-3 font-bold text-black hover:bg-gray-200 transition-colors"
            >
              Voltar ao Jogo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
