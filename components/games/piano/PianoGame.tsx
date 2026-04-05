'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePianoStore } from '@/store/pianoStore'
import { cn } from '@/lib/utils'

// Mapping frequencies for notes starting from C4 (Middle C)
const NOTES: Record<string, number> = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
}

const KEY_MAP: Record<string, string> = {
  'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4',
  't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4', 'k': 'C5'
}

export default function PianoGame() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<Record<string, { osc: OscillatorNode, gain: GainNode }>>({})

  const playNote = useCallback((note: string) => {
    if (!NOTES[note]) return

    // Initialize AudioContext on first interaction
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }

    // Stop existing note if already playing to avoid overlap issues
    stopNote(note)

    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()

    osc.type = 'triangle' 
    osc.frequency.setValueAtTime(NOTES[note], audioCtxRef.current.currentTime)

    gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 1.5)

    osc.connect(gain)
    gain.connect(audioCtxRef.current.destination)

    osc.start()
    
    oscillatorsRef.current[note] = { osc, gain }
    setActiveNotes(prev => new Set(prev).add(note))
  }, [])

  const stopNote = useCallback((note: string) => {
    const oscillatorPair = oscillatorsRef.current[note]
    if (oscillatorPair) {
      const { osc, gain } = oscillatorPair
      if (audioCtxRef.current) {
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.1)
        setTimeout(() => {
          try {
            osc.stop()
            osc.disconnect()
            gain.disconnect()
          } catch (e) {}
        }, 100)
      }
      delete oscillatorsRef.current[note]
      setActiveNotes(prev => {
        const next = new Set(prev)
        next.delete(note)
        return next
      })
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const note = KEY_MAP[e.key.toLowerCase()]
      if (note) playNote(note)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = KEY_MAP[e.key.toLowerCase()]
      if (note) stopNote(note)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [playNote, stopNote])

  const whiteKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
  const blackKeys = [
    { note: 'C#4', left: '9%' },
    { note: 'D#4', left: '21.5%' },
    { note: 'F#4', left: '46.5%' },
    { note: 'G#4', left: '59%' },
    { note: 'A#4', left: '71.5%' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-brand-card to-[#121212] border border-white/5 p-3 sm:p-8 relative overflow-hidden select-none min-h-[350px]">
      <div className="text-center mb-4 sm:mb-10">
        <h2 className="text-lg sm:text-3xl font-bold text-white mb-1 tracking-tight">Piano Mágico 🎹</h2>
        <p className="text-[10px] sm:text-sm text-brand-text px-4">
          <span className="md:hidden">Toque na tela para tocar</span>
          <span className="hidden md:inline">Use o mouse, toque na tela ou as teclas <span className="text-brand-primary font-mono">A S D F G H J K</span></span>
        </p>
      </div>
      
      <div className="relative flex h-56 sm:h-72 w-full max-w-4xl rounded-xl bg-[#080808] p-2 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-4 sm:border-t-8 border-[#333]">
        <div className="flex w-full gap-[1px] sm:gap-[2px] h-full relative">
          
          {/* White Keys */}
          {whiteKeys.map((note) => (
            <div 
              key={note} 
              onPointerDown={(e) => { e.preventDefault(); playNote(note); }}
              onPointerUp={() => stopNote(note)}
              onPointerLeave={() => stopNote(note)}
              className={cn(
                "flex-1 bg-[#fcfcfc] hover:bg-gray-200 cursor-pointer rounded-b-lg shadow-md transition-all duration-75 relative",
                activeNotes.has(note) ? "bg-brand-primary translate-y-1 sm:translate-y-2 shadow-inner" : "shadow-[0_2px_0_#ccc] sm:shadow-[0_4px_0_#ccc]"
              )}
            >
              <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="text-[8px] sm:text-[10px] font-bold text-black/20 uppercase font-mono">{note}</span>
              </div>
            </div>
          ))}

          {/* Black Keys */}
          {blackKeys.map(({ note, left }) => (
            <div 
              key={note}
              onPointerDown={(e) => { e.preventDefault(); playNote(note); }}
              onPointerUp={() => stopNote(note)}
              onPointerLeave={() => stopNote(note)}
              style={{ left, width: '7%', height: '60%' }}
              className={cn(
                "absolute top-0 z-10 bg-[#1a1a1a] hover:bg-gray-800 cursor-pointer rounded-b-md shadow-2xl transition-all duration-75",
                activeNotes.has(note) ? "bg-brand-primary/80 translate-y-1 sm:translate-y-2 shadow-inner" : "shadow-[0_2px_0_#000] sm:shadow-[0_4px_0_#000]"
              )}
            >
               <div className="absolute bottom-1.5 sm:bottom-3 left-0 right-0 text-center pointer-events-none">
                <span className="text-[6px] sm:text-[8px] font-bold text-white/20 uppercase font-mono">{note.replace('#', '')}#</span>
              </div>
            </div>
          ))}

        </div>
      </div>
      
      <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-[9px] sm:text-xs text-brand-text bg-black/20 px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-white/5 mx-2 text-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-brand-primary animate-pulse" />
          <span>Áudio Estéreo</span>
        </div>
        <div className="hidden xs:flex items-center gap-1.5 sm:gap-2">
          <div className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-blue-500" />
          <span className="hidden sm:inline">Suporte a Teclado</span>
          <span className="sm:hidden">Teclado</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-yellow-500" />
          <span>Polifonia</span>
        </div>
      </div>
    </div>
  )
}
