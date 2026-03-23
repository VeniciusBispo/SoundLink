'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PIANO_SONGS, Song, Note } from '@/lib/games/piano/songs'
import { cn } from '@/lib/utils'
import { HiPlay, HiRefresh, HiArrowLeft, HiTrophy, HiUser } from 'react-icons/hi'

// Frequencies for the tiles
const TILE_NOTES = [261.63, 293.66, 329.63, 349.23] // C4, D4, E4, F4
const KEYS = ['s', 'd', 'f', 'g']

interface GameTile extends Note {
  id: string;
  hit: boolean;
  missed: boolean;
}

interface LeaderboardData {
  global: { username: string; score: number; createdAt: string }[];
  personalBest: number;
}

export default function PianoTiles() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [score, setScore] = useState(0)
  const [tiles, setTiles] = useState<GameTile[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [isLoadingRank, setIsLoadingRank] = useState(false)
  
  const startTimeRef = useRef<number>( performance.now())
  const requestRef = useRef<number>()
  const audioCtxRef = useRef<AudioContext | null>(null)

  const fetchLeaderboard = async (songId: string) => {
    setIsLoadingRank(true)
    try {
      const res = await fetch(`/api/games/leaderboard?gameId=piano&songId=${songId}`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingRank(false)
    }
  }

  const saveScore = async (finalScore: number) => {
    if (!selectedSong) return
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'piano',
          songId: selectedSong.id,
          score: finalScore
        })
      })
      fetchLeaderboard(selectedSong.id) // Refresh rank
    } catch (e) {
      console.error(e)
    }
  }

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
    setTimeout(() => {
        try { osc.stop(); osc.disconnect(); } catch(e){}
    }, 500)
  }

  const handleStartRequest = (song: Song) => {
    setSelectedSong(song)
    setGameOver(false)
    setScore(0)
    setCountdown(3)
    fetchLeaderboard(song.id)
  }

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setCountdown(null)
        startGame()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const startGame = () => {
    if (!selectedSong) return
    setIsPlaying(true)
    startTimeRef.current = performance.now()
    const initialTiles = selectedSong.notes.map((n, i) => ({
      ...n,
      id: `tile-${i}`,
      hit: false,
      missed: false
    }))
    setTiles(initialTiles)
  }

  const handleHit = useCallback((lane: number) => {
    if (!isPlaying || gameOver || countdown !== null) return

    setTiles(prev => {
      const now = (performance.now() - startTimeRef.current) / 1000
      let hit = false
      const next = prev.map(t => {
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
  }, [isPlaying, gameOver, countdown])

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
        saveScore(score)
      }
      return next
    })

    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(update)
    }
  }, [isPlaying, gameOver, stopGame, score])

  useEffect(() => {
    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(update)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isPlaying, gameOver, update])

  // --- RENDERING SCREENS ---

  if (!selectedSong || gameOver) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center h-full text-white p-6 overflow-y-auto">
        
        {/* Left: Song List */}
        <div className="w-full lg:w-1/2 max-w-xl">
          <div className="mb-8">
             <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                Desafio do Piano <span className="text-spotify-green">Tiles</span>
             </h2>
             <p className="text-spotify-text text-sm">Escolha uma música e bata seu recorde!</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PIANO_SONGS.map(song => (
              <button
                key={song.id}
                onClick={() => handleStartRequest(song)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                  selectedSong?.id === song.id 
                    ? "bg-spotify-green/10 border-spotify-green/50" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="text-left">
                  <p className="font-bold group-hover:text-spotify-green transition-colors">{song.title}</p>
                  <p className="text-[10px] text-spotify-text uppercase tracking-widest">{song.artist}</p>
                </div>
                <HiPlay className={cn(
                    "h-8 w-8 transition-transform group-hover:scale-110",
                    selectedSong?.id === song.id ? "text-spotify-green" : "text-white/40"
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Stats & Rankings */}
        <div className="w-full lg:w-1/3 max-w-sm">
            {gameOver && (
                <div className="mb-8 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 animate-in zoom-in-95 duration-500 text-center">
                    <p className="text-red-500 font-black text-sm uppercase tracking-widest mb-1">Fim de Jogo</p>
                    <p className="text-5xl font-black mb-4">{score}</p>
                    <button 
                        onClick={() => selectedSong && handleStartRequest(selectedSong)}
                        className="flex items-center gap-2 mx-auto px-6 py-2 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        <HiRefresh /> Tentar Novamente
                    </button>
                </div>
            )}

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                <div>
                   <h3 className="text-sm font-bold text-spotify-text uppercase tracking-widest mb-4 flex items-center gap-2">
                      <HiTrophy className="text-yellow-500" /> Ranking Geral 
                   </h3>
                   {isLoadingRank ? (
                      <div className="h-40 flex items-center justify-center">
                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      </div>
                   ) : leaderboard ? (
                      <div className="space-y-3">
                        {leaderboard.global.length > 0 ? leaderboard.global.map((entry, i) => (
                           <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                             <div className="flex items-center gap-2 max-w-[120px]">
                                <span className={cn(
                                    "w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold",
                                    i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-orange-500 text-black" : "bg-white/10"
                                )}>{i + 1}</span>
                                <span className="truncate font-medium">{entry.username}</span>
                             </div>
                             <span className="font-bold text-spotify-green">{entry.score}</span>
                           </div>
                        )) : (
                           <p className="text-xs text-spotify-text italic">Ninguém jogou ainda. Seja o primeiro!</p>
                        )}
                      </div>
                   ) : (
                      <p className="text-xs text-spotify-text">Selecione uma música para ver o ranking.</p>
                   )}
                </div>

                {leaderboard && (
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HiUser className="text-blue-500" />
                                <span className="text-xs font-bold text-spotify-text uppercase uppercase">Seu Recorde</span>
                            </div>
                            <span className="text-xl font-black text-white">{leaderboard.personalBest}</span>
                        </div>
                    </div>
                )}
            </div>
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
            className={cn(
                "flex-1 border-r border-white/5 relative bg-gradient-to-b from-transparent to-white/5 transition-colors",
                countdown !== null && "opacity-50"
            )}
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
                            "absolute left-0 right-0 h-40 rounded-lg shadow-xl border border-white/10",
                            "bg-gradient-to-b from-white to-gray-200"
                        )}
                        style={{ top: `${top}%` }}
                    />
                )
            })}
            
            {/* Visual Keys at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-28 flex items-center justify-center border-t border-white/5">
                <span className="text-white/20 font-black text-4xl uppercase font-mono tracking-tighter">{KEYS[lane]}</span>
            </div>
          </div>
        ))}

        {/* Hit Zone Indicator */}
        <div className="absolute bottom-28 left-0 right-0 h-1 bg-spotify-green/40 blur-sm pointer-events-none" />
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="text-scale-up text-center">
              <span className="text-[12rem] font-black text-spotify-green drop-shadow-[0_0_50px_rgba(30,215,96,0.5)]">
                 {countdown === 0 ? 'VAI!' : countdown}
              </span>
           </div>
        </div>
      )}

      {/* Stats UI */}
      <div className="absolute top-10 left-10 flex flex-col pointer-events-none">
          <p className="text-xs font-bold text-spotify-text uppercase tracking-widest">Pontuação</p>
          <p className="text-6xl font-black text-white drop-shadow-2xl">{score}</p>
      </div>

      <div className="absolute top-10 right-10 text-right pointer-events-none">
          <p className="text-xs font-bold text-spotify-text uppercase tracking-widest">Música</p>
          <p className="text-lg font-bold text-white truncate max-w-[200px]">{selectedSong.title}</p>
      </div>

      <button 
        onClick={() => { stopGame(); setGameOver(true); }}
        className="absolute top-4 left-4 p-2 text-white/30 hover:text-white transition-colors"
      >
        <HiArrowLeft className="h-6 w-6" />
      </button>
    </div>
  )
}
