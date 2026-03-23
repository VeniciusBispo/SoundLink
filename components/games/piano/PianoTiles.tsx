'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PIANO_SONGS, Song, Note } from '@/lib/games/piano/songs'
import { cn } from '@/lib/utils'
import { HiPlay, HiRefresh, HiArrowLeft } from 'react-icons/hi'

// Frequencies for the tiles
const TILE_NOTES = [261.63, 293.66, 329.63, 349.23] // C4, D4, E4, F4
const KEYS = ['s', 'd', 'f', 'g']

interface GameTile extends Note {
  id: string;
  hit: boolean;
  missed: boolean;
}

export default function PianoTiles() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [score, setScore] = useState(0)
  const [tiles, setTiles] = useState<GameTile[]>([])
  const [gameOver, setGameOver] = useState(false)
  
  const startTimeRef = useRef<number>(0)
  const requestRef = useRef<number>()
  const audioCtxRef = useRef<AudioContext | null>(null)

  const stopGame = useCallback(() => {
    setIsPlaying(false)
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
  }, [])

  const playNote = (index: number) => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(TILE_NOTES[index], audioCtxRef.current.currentTime)
    gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.5)
    osc.connect(gain)
    gain.connect(audioCtxRef.current.destination)
    osc.start()
    setTimeout(() => osc.stop(), 500)
  }

  const startGame = (song: Song) => {
    setSelectedSong(song)
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
    startTimeRef.current = performance.now()
    
    const initialTiles = song.notes.map((n, i) => ({
      ...n,
      id: `tile-${i}`,
      hit: false,
      missed: false
    }))
    setTiles(initialTiles)
  }

  const handleHit = useCallback((lane: number) => {
    if (!isPlaying || gameOver) return

    setTiles(prev => {
      const now = (performance.now() - startTimeRef.current) / 1000
      let hit = false
      const next = prev.map(t => {
        // Simple hit detection: if tile is in a certain range of time
        if (!t.hit && !t.missed && t.lane === lane) {
          const diff = Math.abs(t.time - now)
          if (diff < 0.25) {
            hit = true
            playNote(lane)
            return { ...t, hit: true }
          }
        }
        return t
      })
      if (hit) setScore(s => s + 10)
      return next
    })
  }, [isPlaying, gameOver])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const idx = KEYS.indexOf(e.key.toLowerCase())
      if (idx !== -1) handleHit(idx)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleHit])

  const update = useCallback((time: number) => {
    const now = (time - startTimeRef.current) / 1000

    setTiles(prev => {
      let lost = false
      const next = prev.map(t => {
        if (!t.hit && !t.missed && now > t.time + 0.3) {
          lost = true
          return { ...t, missed: true }
        }
        return t
      })
      if (lost) {
        setGameOver(true)
        stopGame()
      }
      return next
    })

    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(update)
    }
  }, [isPlaying, gameOver, stopGame])

  useEffect(() => {
    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(update)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isPlaying, gameOver, update])

  if (!selectedSong || gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white px-6">
        <h2 className="text-3xl font-black mb-6">Desafio do Piano 🎹</h2>
        
        {gameOver && (
          <div className="mb-8 text-center animate-in zoom-in-95 duration-300">
            <p className="text-red-500 font-bold text-xl mb-2">FIM DE JOGO!</p>
            <p className="text-4xl font-black mb-4">Pontuação: {score}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {PIANO_SONGS.map(song => (
            <button
              key={song.id}
              onClick={() => startGame(song)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all group"
            >
              <div className="text-left">
                <p className="font-bold">{song.title}</p>
                <p className="text-xs text-spotify-text">{song.artist}</p>
              </div>
              <HiPlay className="h-8 w-8 text-spotify-green group-hover:scale-110 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 flex flex-col items-center justify-end overflow-hidden bg-[#050505]">
      {/* 4 Lanes */}
      <div className="flex w-full h-full max-w-xl mx-auto border-x border-white/10 relative">
        {[0, 1, 2, 3].map(lane => (
          <div 
            key={lane} 
            className="flex-1 border-r border-white/5 relative bg-gradient-to-b from-transparent to-white/5"
            onClick={() => handleHit(lane)}
          >
            {/* Falling Tiles */}
            {tiles.filter(t => t.lane === lane && !t.hit).map(t => {
                const now = (performance.now() - startTimeRef.current) / 1000;
                const top = ((t.time - now) * 100) / 2; // Speed factor
                if (top > 120 || top < -20) return null;

                return (
                    <div 
                        key={t.id}
                        className={cn(
                            "absolute left-0 right-0 h-32 rounded-lg shadow-lg transition-transform",
                            "bg-white/80 active:bg-spotify-green"
                        )}
                        style={{ top: `${top}%` }}
                    />
                )
            })}
            
            {/* Visual Keys at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 flex items-center justify-center">
                <span className="text-white/20 font-black text-2xl uppercase">{KEYS[lane]}</span>
            </div>
          </div>
        ))}

        {/* Dynamic Hit Line */}
        <div className="absolute bottom-24 left-0 right-0 h-[2px] bg-spotify-green/30 blur-sm pointer-events-none" />
      </div>

      {/* Score */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-4xl font-black text-white drop-shadow-lg">{score}</p>
      </div>

      <button 
        onClick={() => setGameOver(true)}
        className="absolute top-4 left-4 p-2 text-white/50 hover:text-white transition-colors"
      >
        <HiArrowLeft className="h-6 w-6" />
      </button>
    </div>
  )
}
