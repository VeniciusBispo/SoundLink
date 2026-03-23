'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PIANO_SONGS, Song, Note } from '@/lib/games/piano/songs'
import { cn } from '@/lib/utils'
import { HiPlay, HiRefresh, HiArrowLeft, HiStar, HiUser } from 'react-icons/hi'

const KEYS = ['s', 'd', 'f', 'g']
const TILE_NOTES = [261.63, 293.66, 329.63, 349.23]

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
  
  const startTimeRef = useRef<number>(0)
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
      fetchLeaderboard(selectedSong.id)
    } catch (e) {
      console.error(e)
    }
  }

  const playNote = (index: number) => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(TILE_NOTES[index], audioCtxRef.current.currentTime)
    gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.4)
    osc.connect(gain)
    gain.connect(audioCtxRef.current.destination)
    osc.start()
    setTimeout(() => { try { osc.stop(); osc.disconnect(); } catch(e){} }, 500)
  }

  const handleStartRequest = (song: Song) => {
    setSelectedSong(song)
    setGameOver(false)
    setScore(0)
    setCountdown(3)
    fetchLeaderboard(song.id)
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => { setCountdown(null); startGame(); }, 500)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const startGame = () => {
    if (!selectedSong) return
    setIsPlaying(true)
    startTimeRef.current = performance.now()
    setTiles(selectedSong.notes.map((n, i) => ({ ...n, id: `tile-${i}`, hit: false, missed: false })))
  }

  const stopGame = useCallback(() => {
    setIsPlaying(false)
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
  }, [])

  const handleHit = useCallback((lane: number) => {
    if (!isPlaying || gameOver || countdown !== null) return

    setTiles(prev => {
      const now = (performance.now() - startTimeRef.current) / 1000
      let hit = false
      const next = prev.map(t => {
        if (!t.hit && !t.missed && t.lane === lane) {
          const diff = Math.abs(t.time - now)
          if (diff < 0.2) { // Tightened window for better precision
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
    if (!isPlaying || !selectedSong) return
    const now = (time - startTimeRef.current) / 1000
    
    // Dynamic Speed Logic
    // Starts at 30 units/sec and increases based on time and difficulty
    const baseSpeed = 40 + (selectedSong.difficulty * 5)
    const acceleration = Math.min(now * 1.5, selectedSong.difficulty * 15)
    const currentSpeed = baseSpeed + acceleration

    setTiles(prev => {
      let lost = false
      const next = prev.map(t => {
        // A tile is missed if it has completely passed the hit line
        // Assuming the hit line is at top 90%
        if (!t.hit && !t.missed && now > t.time + 0.15) {
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

    if (!gameOver) {
      requestRef.current = requestAnimationFrame(update)
    }
  }, [isPlaying, gameOver, stopGame, score, selectedSong])

  useEffect(() => {
    if (isPlaying && !gameOver) {
      requestRef.current = requestAnimationFrame(update)
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }
  }, [isPlaying, gameOver, update])

  // Helper to calculate tile top position
  const getTilePos = (tileTime: number) => {
    if (!selectedSong) return -100
    const now = (performance.now() - startTimeRef.current) / 1000
    const baseSpeed = 40 + (selectedSong.difficulty * 5)
    const acceleration = Math.min(now * 1.5, selectedSong.difficulty * 15)
    const currentSpeed = baseSpeed + acceleration
    
    // Position = (NoteTime - Now) * Speed + HitLineOffset
    return (tileTime - now) * currentSpeed + 80 
  }

  // --- RENDERING ---

  if (!selectedSong || gameOver) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center h-full text-white p-6 overflow-y-auto bg-[#0a0a0a]">
        
        {/* Left: Song List */}
        <div className="w-full lg:w-1/2 max-w-xl">
          <div className="mb-8 p-4 bg-gradient-to-r from-spotify-green/10 to-transparent rounded-2xl border-l-4 border-spotify-green">
             <h2 className="text-3xl font-black mb-1">Piano Tiles: <span className="text-spotify-green">Pro</span></h2>
             <p className="text-spotify-text text-sm">A velocidade aumenta conforme você acerta! ⚡</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PIANO_SONGS.map(song => (
              <button
                key={song.id}
                onClick={() => handleStartRequest(song)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] group",
                  selectedSong?.id === song.id 
                    ? "bg-spotify-green/10 border-spotify-green/40 shadow-[0_0_20px_rgba(30,215,96,0.1)]" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="text-left">
                  <p className="font-bold group-hover:text-spotify-green transition-colors">{song.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-spotify-text uppercase tracking-widest">{song.artist}</p>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <div className="flex gap-0.5">
                       {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i < song.difficulty ? "bg-spotify-green" : "bg-white/10")} />
                       ))}
                    </div>
                  </div>
                </div>
                <HiPlay className={cn(
                    "h-8 w-8 transition-transform group-hover:scale-110",
                    selectedSong?.id === song.id ? "text-spotify-green" : "text-white/40"
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="w-full lg:w-1/3 max-w-sm">
            {gameOver && (
                <div className="mb-6 p-8 rounded-[32px] bg-red-500/10 border border-red-500/20 text-center shadow-xl">
                    <p className="text-red-500 font-black text-xs uppercase tracking-[0.2em] mb-2 font-mono">Game Over</p>
                    <p className="text-6xl font-black mb-6 drop-shadow-lg">{score}</p>
                    <button 
                        onClick={() => selectedSong && handleStartRequest(selectedSong)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-2xl font-black text-sm hover:scale-[1.03] transition-transform active:scale-95 shadow-lg"
                    >
                        <HiRefresh className="h-5 w-5" /> RECOMEÇAR
                    </button>
                </div>
            )}

            <div className="rounded-[32px] bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                   <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <HiStar className="text-yellow-500 h-4 w-4" /> Melhores Jogadores
                   </h3>
                </div>
                <div className="p-6 pt-4 min-h-[300px]">
                   {isLoadingRank ? (
                      <div className="h-40 flex items-center justify-center">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green" />
                      </div>
                   ) : leaderboard ? (
                      <div className="space-y-4">
                        {leaderboard.global.length > 0 ? leaderboard.global.map((entry, i) => (
                           <div key={i} className="flex items-center justify-between group">
                             <div className="flex items-center gap-3">
                                <span className={cn(
                                    "w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black",
                                    i === 0 ? "bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.3)]" : 
                                    i === 1 ? "bg-gray-300 text-black shadow-[0_0_10px_rgba(209,213,219,0.3)]" : 
                                    i === 2 ? "bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.3)]" : 
                                    "bg-white/10 text-white/40"
                                )}>{i + 1}</span>
                                <span className="truncate font-bold text-sm group-hover:text-spotify-green transition-colors">{entry.username}</span>
                             </div>
                             <span className="font-black text-white">{entry.score}</span>
                           </div>
                        )) : (
                           <div className="text-center py-10 opacity-30">
                              <HiStar className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-xs italic">Ainda não há recordes</p>
                           </div>
                        )}
                      </div>
                   ) : (
                      <div className="text-center py-12 opacity-20">
                         <p className="text-sm font-bold">CARREGANDO...</p>
                      </div>
                   )}
                </div>

                {leaderboard && (
                    <div className="p-6 bg-spotify-green/10 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-black/20 rounded-lg">
                                    <HiUser className="text-spotify-green h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Seu Recorde</span>
                            </div>
                            <span className="text-2xl font-black text-spotify-green drop-shadow-md">{leaderboard.personalBest}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    )
  }

  // GAMEPLAY LOOP VIEW
  return (
    <div className="relative flex-1 flex flex-col items-center justify-end overflow-hidden bg-black select-none">
      
      {/* 4 Tracks Container */}
      <div className="flex w-full h-full max-w-xl mx-auto border-x border-white/10 relative shadow-[0_0_100px_rgba(255,255,255,0.02)]">
        
        {/* Animated Lane Backgrounds */}
        <div className="absolute inset-0 flex">
            {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex-1 border-r border-white/[0.03] last:border-0 bg-gradient-to-b from-transparent via-transparent to-white/[0.02]" />
            ))}
        </div>

        {[0, 1, 2, 3].map(lane => (
          <div 
            key={lane} 
            className="flex-1 relative transition-colors h-full"
            onPointerDown={() => handleHit(lane)}
          >
            {/* Tiles Logic */}
            {tiles.filter(t => t.lane === lane && !t.hit).map(t => {
                const top = getTilePos(t.time)
                if (top > 120 || top < -50) return null

                return (
                    <div 
                        key={t.id}
                        className={cn(
                            "absolute left-[5%] right-[5%] h-52 rounded-2xl shadow-2xl transition-all duration-75",
                            "bg-gradient-to-br from-white via-gray-100 to-gray-300 border-2 border-white/50",
                            "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:to-white/40 before:rounded-2xl"
                        )}
                        style={{ top: `${top}%` }}
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-spotify-green/0 group-active:bg-spotify-green/20 rounded-2xl" />
                    </div>
                )
            })}
          </div>
        ))}

        {/* --- PERSISTENT GAME UI --- */}

        {/* Hit Zone Line (Bottom Area) */}
        <div className="absolute bottom-[20%] left-0 right-0 h-24 pointer-events-none flex flex-col items-center">
            {/* The Target Line */}
            <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-spotify-green/60 to-transparent blur-[1px] relative">
                <div className="absolute inset-0 bg-spotify-green animate-pulse opacity-40 shadow-[0_0_20px_rgba(30,215,96,0.8)]" />
            </div>
            
            {/* Labels under the line */}
            <div className="flex w-full mt-4 opacity-10">
                {KEYS.map(k => (
                    <div key={k} className="flex-1 text-center font-black text-4xl uppercase font-mono">{k}</div>
                ))}
            </div>
        </div>

        {/* Visual feedback for key presses */}
        <div className="absolute bottom-0 left-0 right-0 h-[20%] flex pointer-events-none z-10">
            {[0, 1, 2, 3].map(i => (
                 <div key={i} className="flex-1 border-r border-white/5 last:border-0 relative">
                     <div className="absolute inset-0 bg-spotify-green/0 active:bg-spotify-green/10 transition-colors" />
                 </div>
            ))}
        </div>
      </div>

      {/* OVERLAYS */}

      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-500">
           <div className="text-scale-up text-center">
              <span className="text-[14rem] font-black text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.4)] tracking-tighter italic">
                 {countdown === 0 ? 'PLAY!' : countdown}
              </span>
           </div>
        </div>
      )}

      {/* Floating Score */}
      <div className="absolute top-12 left-12 flex flex-col pointer-events-none drop-shadow-2xl">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Total Score</p>
          <p className="text-7xl font-black text-white tracking-tighter leading-none">{score}</p>
          <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 w-fit backdrop-blur-md">
             <HiStar className="text-yellow-400 h-3 w-3 animate-pulse" />
             <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                X{Math.floor(1 + selectedSong.difficulty * 0.5 + (score/500))} COMBO
             </span>
          </div>
      </div>

      {/* Top Right Info */}
      <div className="absolute top-12 right-12 text-right pointer-events-none drop-shadow-xl">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Playing</p>
          <p className="text-xl font-bold text-white max-w-[250px] leading-tight">{selectedSong.title}</p>
          <p className="text-xs text-spotify-green font-mono uppercase tracking-widest mt-1 opacity-80">LEVEL {selectedSong.difficulty}</p>
      </div>

      <button 
        onClick={() => { stopGame(); setGameOver(true); }}
        className="absolute bottom-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all hover:scale-110 z-50"
      >
        <HiArrowLeft className="h-6 w-6" />
      </button>

      {/* CSS For scaling animation */}
      <style jsx>{`
        .text-scale-up {
          animation: scaleUp 0.5s ease-out;
        }
        @keyframes scaleUp {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
