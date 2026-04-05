'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
          className="mb-4 text-xs text-brand-text hover:text-white flex items-center gap-1"
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
          className="mb-4 text-xs text-brand-text hover:text-white flex items-center gap-1"
        >
           ← Voltar ao menu do Piano
        </button>
        <PianoTiles />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl sm:rounded-[40px] bg-[#050505] border border-white/5 p-4 sm:p-12 text-center relative overflow-hidden min-h-[500px] sm:min-h-[600px] shadow-2xl">
      {/* Dynamic Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [-20, 20, -20],
          y: [-20, 20, -20]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.15, 0.05],
          x: [20, -20, 20],
          y: [20, -20, 20]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600 blur-[150px] rounded-full pointer-events-none" 
      />

      <div className="relative z-20 max-w-3xl w-full">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-6xl font-black text-white mb-3 sm:mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-tight">
            Piano Mágico 🎹
          </h2>
          <p className="text-sm sm:text-xl text-brand-text mb-8 sm:mb-12 font-medium opacity-80 max-w-xl mx-auto leading-relaxed px-4">
            Vivencie a música de uma forma única. Escolha sua jornada sonora.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full px-4">
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            onClick={() => setMode('free')}
            className="group relative flex flex-col items-center gap-6 rounded-[32px] bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 border border-white/10 hover:border-brand-primary/40 transition-all duration-500 hover:shadow-[0_0_50px_rgba(30,215,96,0.15)]"
          >
            <div className="p-6 bg-brand-primary/10 rounded-3xl group-hover:bg-brand-primary/20 group-hover:scale-110 transition-all duration-500 shadow-inner">
              <HiMusicNote className="h-10 w-10 sm:h-14 sm:h-14 text-brand-primary drop-shadow-[0_0_10px_rgba(30,215,96,0.5)]" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-brand-primary transition-colors leading-none">Tocar Livre</h3>
              <p className="text-xs sm:text-sm text-brand-text font-medium leading-relaxed opacity-60">Pratique livremente com feedback sonoro em tempo real.</p>
            </div>
            
            {/* Visual Polish: Corner Glow */}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onClick={() => setMode('tiles')}
            className="group relative flex flex-col items-center gap-6 rounded-[32px] bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 border border-white/10 hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)]"
          >
            <div className="p-6 bg-purple-500/10 rounded-3xl group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-500 shadow-inner">
              <HiPuzzle className="h-10 w-10 sm:h-14 sm:h-14 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-400 transition-colors leading-none">Modo Desafio</h3>
              <p className="text-xs sm:text-sm text-brand-text font-medium leading-relaxed opacity-60">Acerte as notas no ritmo da música e bata recordes.</p>
            </div>
            
            <div className="absolute top-6 right-6">
              <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">
                Pro
              </div>
            </div>
          </motion.button>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 text-[10px] font-bold text-white uppercase tracking-[0.4em] font-mono"
        >
          SoundLink Virtual Maestro Engine v2.0
        </motion.p>
      </div>
    </div>
  )
}
