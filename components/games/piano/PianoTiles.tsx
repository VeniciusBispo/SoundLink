'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { PIANO_SONGS, Song, Note } from '@/lib/games/piano/songs'
import { cn } from '@/lib/utils'
import { HiPlay, HiRefresh, HiArrowLeft, HiStar, HiUser, HiChevronRight, HiFire, HiBadgeCheck } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

const KEYS = ['s', 'd', 'f', 'g']
const TILE_NOTES = [261.63, 293.66, 329.63, 349.23]
const PHASE_NAMES = ['Fácil', 'Médio', 'Difícil', 'Hardcore']
const PHASE_SPEEDS = [1.0, 1.4, 1.85, 2.3]

interface GameTile extends Note {
  id: string;
  hit: boolean;
  missed: boolean;
}

interface LeaderboardData {
  global: { username: string; score: number; createdAt: string }[];
  personalBest: number;
}

interface Feedback {
  id: number;
  text: string;
  type: 'perfect' | 'great' | 'good' | 'miss';
}

export default function PianoTiles() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [score, setScore] = useState(0)
  const [tiles, setTiles] = useState<GameTile[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [isVictory, setIsVictory] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [isLoadingRank, setIsLoadingRank] = useState(false)
  
  const [laneFlashes, setLaneFlashes] = useState<boolean[]>([false, false, false, false])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  
  const startTimeRef = useRef<number>(0)
  const requestRef = useRef<number>()
  const audioCtxRef = useRef<AudioContext | null>(null)
  const scoreRef = useRef(0)

  // Buffer to allow tiles to fall from top
  const START_DELAY = 1.6; 

  const maxPossibleScore = useMemo(() => {
    if (!selectedSong) return 0
    const multiplier = 1 + currentPhase * 0.5
    return selectedSong.notes.length * 30 * multiplier
  }, [selectedSong, currentPhase])

  const fetchLeaderboard = useCallback(async (songId: string) => {
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
  }, [])

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

  const playNote = useCallback((index: number) => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()

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
  }, [])

  const stopGame = useCallback(() => {
    setIsPlaying(false)
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
  }, [])

  const triggerFeedback = useCallback((text: string, type: Feedback['type']) => {
    const id = Date.now() + Math.random()
    setFeedbacks([{ id, text, type }]) 
    const timer = setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== id)), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleHit = useCallback((lane: number) => {
    if (!isPlaying || gameOver || isVictory || countdown !== null || startTimeRef.current === 0) return

    setLaneFlashes(prev => {
        const next = [...prev]
        next[lane] = true
        return next
    })
    setTimeout(() => setLaneFlashes(prev => {
        const next = [...prev]
        next[lane] = false
        return next
    }), 100)

    setTiles(prev => {
      const now = (performance.now() - startTimeRef.current) / 1000
      const currentFactor = PHASE_SPEEDS[currentPhase]
      
      const hitIdx = prev.findIndex(t => 
        !t.hit && !t.missed && t.lane === lane && 
        Math.abs((t.time + START_DELAY) - now) < (0.28 / currentFactor)
      )

      if (hitIdx !== -1) {
        const tile = prev[hitIdx]
        const diff = Math.abs((tile.time + START_DELAY) - now)
        
        let hitType: Feedback['type'] = 'good'
        const windowFactor = 1 / currentFactor
        if (diff < 0.08 * windowFactor) hitType = 'perfect'
        else if (diff < 0.18 * windowFactor) hitType = 'great'

        const basePoints = hitType === 'perfect' ? 30 : (hitType === 'great' ? 20 : 10)
        const points = Math.floor(basePoints * (1 + currentPhase * 0.5))
        scoreRef.current += points
        setScore(scoreRef.current)
        playNote(lane)
        triggerFeedback(hitType.toUpperCase() + '!', hitType)

        return prev.map((t, idx) => idx === hitIdx ? { ...t, hit: true } : t)
      }
      return prev
    })
  }, [isPlaying, gameOver, isVictory, countdown, playNote, triggerFeedback, currentPhase])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const idx = KEYS.indexOf(e.key.toLowerCase())
      if (idx !== -1) handleHit(idx)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleHit])

  const update = useCallback((time: number) => {
    if (!isPlaying || !selectedSong || gameOver || isVictory) return
    
    if (startTimeRef.current === 0) {
        startTimeRef.current = time
    }

    const now = (time - startTimeRef.current) / 1000
    const currentFactor = PHASE_SPEEDS[currentPhase]

    setTiles(prev => {
      let lost = false
      const next = prev.map(t => {
        if (!t.hit && !t.missed && now > 0.5 && now > t.time + START_DELAY + (0.35 / currentFactor)) {
          lost = true
          return { ...t, missed: true }
        }
        return t
      })

      if (lost) {
        setGameOver(true)
        stopGame()
        saveScore(scoreRef.current)
      } else {
        const allProcessed = next.every(t => t.hit || t.missed)
        if (allProcessed && now > 0.5 && next.length > 0) {
           const someMissed = next.some(t => t.missed)
           if (!someMissed) {
              setIsVictory(true)
              stopGame()
              saveScore(scoreRef.current)
           }
        }
      }
      return next
    })

    if (!gameOver && !isVictory) {
      requestRef.current = requestAnimationFrame(update)
    }
  }, [isPlaying, gameOver, isVictory, stopGame, selectedSong, currentPhase])

  useEffect(() => {
    if (isPlaying && !gameOver && !isVictory) {
      requestRef.current = requestAnimationFrame(update)
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }
  }, [isPlaying, gameOver, isVictory, update])

  const startGame = useCallback(() => {
    if (!selectedSong) return
    setGameOver(false)
    setIsVictory(false)
    setScore(0)
    scoreRef.current = 0
    startTimeRef.current = 0 
    setTiles(selectedSong.notes.map((n, i) => ({ ...n, id: `tile-${i}-${Date.now()}`, hit: false, missed: false })))
    setIsPlaying(true)
  }, [selectedSong])

  const handleStartRequest = (song: Song, phaseIndex: number = 0) => {
    setTiles([]) 
    setSelectedSong(song)
    setCurrentPhase(phaseIndex)
    setGameOver(false)
    setIsVictory(false)
    setScore(0)
    scoreRef.current = 0
    setCountdown(3)
    setFeedbacks([])
    fetchLeaderboard(song.id)
  }

  const handleNextLevel = () => {
    if (!selectedSong) return
    if (currentPhase < 3) {
        handleStartRequest(selectedSong, currentPhase + 1)
    } else {
        const currentIndex = PIANO_SONGS.findIndex(s => s.id === selectedSong.id)
        const nextSong = PIANO_SONGS[currentIndex + 1]
        if (nextSong) {
            handleStartRequest(nextSong, 0)
        }
    }
  }

  useEffect(() => {
    if (countdown === null) return
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000)
    } else {
      timer = setTimeout(() => { 
          setCountdown(null)
          startGame()
      }, 500)
    }
    return () => clearTimeout(timer)
  }, [countdown, startGame])

  const getTilePos = (tileTime: number, now: number) => {
    if (!selectedSong) return -200
    const phaseFactor = PHASE_SPEEDS[currentPhase]
    const baseSpeed = (40 + (selectedSong.difficulty * 6)) * phaseFactor
    const acceleration = Math.min(now * 1.8, selectedSong.difficulty * 25) * phaseFactor
    const currentSpeed = baseSpeed + acceleration
    return 85 - (tileTime + START_DELAY - now) * currentSpeed 
  }

  // --- RENDERING ---

  const currentNow = startTimeRef.current === 0 ? 0 : (performance.now() - startTimeRef.current) / 1000
  const songTitle = selectedSong?.title || ''
  const songDifficulty = selectedSong?.difficulty || 1

  if (!selectedSong || gameOver || isVictory) {
    const hasNextOption = selectedSong && (currentPhase < 3 || PIANO_SONGS.findIndex(s => s.id === selectedSong.id) < PIANO_SONGS.length - 1)
    const isPerfectClear = isVictory && score === maxPossibleScore

    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center h-full text-white p-6 overflow-y-auto bg-black">
        
        <div className="w-full lg:w-1/2 max-w-xl">
          <div className="mb-8 p-6 bg-gradient-to-br from-spotify-green/20 to-transparent rounded-[32px] border border-white/5 relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-spotify-green/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
             <h2 className="text-4xl font-black mb-1">Piano <span className="text-spotify-green">Pro</span></h2>
             <p className="text-spotify-text text-sm font-medium">Bata o recorde global no ritmo das estrelas.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {PIANO_SONGS.map(song => (
              <button
                key={song.id}
                onClick={() => handleStartRequest(song)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group",
                  selectedSong?.id === song.id 
                    ? "bg-spotify-green/15 border-spotify-green/50 shadow-[0_15px_40px_-15px_rgba(30,215,96,0.3)]" 
                    : "bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/20"
                )}
              >
                <div className="text-left">
                  <p className="text-lg font-black group-hover:text-spotify-green transition-colors">{song.title}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-spotify-text font-black uppercase tracking-[0.2em]">{song.artist}</p>
                    <div className="flex gap-1 items-center bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                       {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i < song.difficulty ? "bg-spotify-green shadow-[0_0_5px_#1ed760]" : "bg-white/10")} />
                       ))}
                       <span className="text-[9px] font-black text-white/40 ml-1">{song.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-spotify-green group-hover:text-black transition-all">
                    <HiPlay className="h-6 w-6" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/3 max-sm">
            {(gameOver || isVictory) && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={cn(
                        "mb-8 p-10 rounded-[40px] text-center shadow-2xl relative overflow-hidden border",
                        isVictory ? "bg-gradient-to-b from-spotify-green/20 to-transparent border-spotify-green/30" : "bg-gradient-to-b from-red-500/20 to-transparent border-red-500/30"
                    )}
                >
                    {isVictory && (
                        <div className="absolute top-0 left-0 right-0 h-40 bg-spotify-green/10 blur-[50px] -z-10" />
                    )}
                    
                    <p className={cn(
                        "font-black text-xs uppercase tracking-[0.3em] mb-3",
                        isVictory ? "text-spotify-green" : "text-red-500"
                    )}>
                        {isVictory ? `Concluído: ${PHASE_NAMES[currentPhase]}` : "Sessão Encerrada"}
                    </p>
                    
                    <h2 className="text-2xl font-black mb-1">
                        {isVictory ? (currentPhase === 3 ? "LENDÁRIO!" : "Parabéns, Maestro!") : "Quase lá!"}
                    </h2>

                    {isPerfectClear && (
                        <motion.div 
                            initial={{ scale: 0, rotate: -20 }} 
                            animate={{ scale: 1, rotate: 0 }}
                            className="mt-2 bg-yellow-500 text-black px-4 py-1.5 rounded-full flex items-center justify-center gap-2 mx-auto w-fit shadow-[0_10px_20px_rgba(234,179,8,0.3)]"
                        >
                            <HiBadgeCheck className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Perfect Clear</span>
                        </motion.div>
                    )}
                    
                    <div className="my-8 relative">
                        <p className="text-7xl font-black drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] leading-none">{score}</p>
                        <p className="text-[10px] font-black opacity-30 mt-3 uppercase tracking-[0.3em]">
                            Máximo da Fase: {maxPossibleScore}
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        {isVictory && hasNextOption && (
                            <button 
                                onClick={handleNextLevel}
                                className="w-full py-5 bg-spotify-green text-black rounded-2xl font-black text-sm hover:translate-y-[-2px] transition-all active:scale-95 shadow-[0_10px_30px_rgba(30,215,96,0.3)] flex items-center justify-center gap-2"
                            >
                                {currentPhase < 3 ? `PRÓXIMA FASE: ${PHASE_NAMES[currentPhase+1]}` : "PRÓXIMA MÚSICA"} <HiChevronRight className="h-5 w-5" />
                            </button>
                        )}
                        <button 
                            onClick={() => selectedSong && handleStartRequest(selectedSong, currentPhase)}
                            className="w-full py-5 bg-white/10 text-white rounded-2xl font-black text-sm hover:bg-white/20 transition-all active:scale-95"
                        >
                            RECOMEÇAR FASE
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="rounded-[40px] bg-white/[0.03] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                      <HiStar className="text-yellow-500 h-4 w-4" /> Melhores do Mundo
                   </h3>
                </div>
                <div className="p-8 space-y-5 min-h-[350px]">
                   {isLoadingRank ? (
                      <div className="h-40 flex items-center justify-center">
                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-spotify-green" />
                      </div>
                   ) : leaderboard ? (
                      <div className="space-y-4">
                        {leaderboard.global.length > 0 ? leaderboard.global.map((entry, i) => (
                           <motion.div 
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.1 }}
                             key={i} 
                             className="flex items-center justify-between group py-1"
                           >
                             <div className="flex items-center gap-4">
                                <span className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black",
                                    i === 0 ? "bg-yellow-500 text-black" : 
                                    i === 1 ? "bg-gray-300 text-black" : 
                                    i === 2 ? "bg-[#CD7F32] text-black" : 
                                    "bg-white/5 text-white/30"
                                )}>{i + 1}</span>
                                <span className="font-bold text-sm group-hover:text-spotify-green transition-colors">{entry.username}</span>
                             </div>
                             <span className="font-black text-spotify-green text-sm">{entry.score}</span>
                           </motion.div>
                        )) : (
                           <div className="text-center py-20 opacity-20">
                              <HiStar className="h-16 w-16 mx-auto mb-4 border-2 border-dashed border-white rounded-full p-3" />
                              <p className="text-xs font-bold uppercase tracking-widest">Seja o primeiro da lista</p>
                           </div>
                        )}
                      </div>
                   ) : (
                      <div className="text-center py-12 opacity-20">
                         <p className="text-xs font-black tracking-widest">AGUARDANDO...</p>
                      </div>
                   )}
                </div>

                {leaderboard && (
                    <div className="p-8 bg-gradient-to-r from-spotify-green/10 to-transparent border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                                    <HiUser className="text-spotify-green h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Seu Melhor</p>
                                    <p className="text-2xl font-black text-white leading-none">{leaderboard.personalBest}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 flex flex-col items-center justify-end overflow-hidden bg-[#020202] select-none cursor-crosshair">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-spotify-green/5 to-transparent pointer-events-none" />
      <div className="flex w-full h-full max-w-xl mx-auto border-x border-white/[0.08] relative">
        {[0, 1, 2, 3].map(lane => (
          <div 
            key={lane} 
            className="flex-1 relative h-full flex flex-col justify-end"
            onPointerDown={() => handleHit(lane)}
          >
            <AnimatePresence mode="popLayout">
                {laneFlashes[lane] && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white"
                    />
                )}
            </AnimatePresence>
            <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/[0.03]" />
            {tiles.filter(t => t.lane === lane && !t.hit && !t.missed).map(t => {
                const top = getTilePos(t.time, currentNow)
                if (top > 120 || top < -100) return null
                return (
                    <div 
                        key={t.id}
                        className={cn(
                            "absolute left-[8%] right-[8%] h-40 rounded-[32px] shadow-2xl",
                            "bg-gradient-to-br from-white via-[#f0f0f0] to-[#ddd] border-2 border-white/20",
                            "after:absolute after:inset-4 after:border after:border-black/5 after:rounded-[24px]"
                        )}
                        style={{ top: `calc(${top}% - 160px)` }}
                    />
                )
            })}
            <div className="h-[15%] w-full flex items-center justify-center border-t border-white/[0.05] relative bg-white/[0.01]">
                <span className="text-white/10 font-black text-5xl font-mono">{KEYS[lane]}</span>
            </div>
          </div>
        ))}
        <div className="absolute top-[85%] left-0 right-0 h-[2px] bg-spotify-green shadow-[0_0_25px_#1ed760] z-20 pointer-events-none opacity-80" />
      </div>

      <div className="absolute bottom-[35%] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 h-20">
        <AnimatePresence mode="wait">
            {feedbacks.map(f => (
                <motion.div
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1.2, y: -20 }}
                    exit={{ opacity: 0, y: -40 }}
                    className={cn(
                        "text-3xl font-black italic tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]",
                        f.type === 'perfect' ? "text-yellow-400" : f.type === 'great' ? "text-blue-400" : "text-white"
                    )}
                >
                    {f.text}
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {countdown !== null && (
          <motion.div 
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
          >
            <motion.div 
                key={countdown}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="text-center"
            >
              <div className="flex flex-col items-center">
                <span className="text-[3rem] font-black text-spotify-green uppercase tracking-[0.3em] mb-[-4rem] opacity-50 italic">
                    {PHASE_NAMES[currentPhase]}
                </span>
                <span className="text-[15rem] font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] italic tracking-tighter">
                    {countdown === 0 ? 'GO!' : countdown}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-16 left-16 flex flex-col pointer-events-none">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-2 font-mono">
              SCORE • {PHASE_NAMES[currentPhase]}
          </p>
          <div className="flex items-baseline gap-4">
            <motion.p 
                key={score}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-8xl font-black text-white tracking-tighter tabular-nums leading-none"
            >
                {score}
            </motion.p>
            <p className="text-xl font-black text-white/20 tracking-tighter tabular-nums">/ {maxPossibleScore}</p>
          </div>
      </div>

      <div className="absolute top-16 right-16 text-right pointer-events-none">
          <div className="flex items-center justify-end gap-2 mb-2">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">LEVEL {songDifficulty}</p>
            {currentPhase > 0 && (
                <div className="flex gap-0.5">
                    {Array.from({ length: currentPhase }).map((_, i) => (
                        <HiFire key={i} className="text-orange-500 h-3 w-3 animate-pulse" />
                    ))}
                </div>
            )}
          </div>
          <p className="text-2xl font-black text-white truncate max-w-[300px]">{songTitle}</p>
          <p className={cn(
            "text-xs font-black uppercase tracking-widest mt-1 italic",
            currentPhase === 3 ? "text-red-500 animate-pulse" : "text-spotify-green"
          )}>
            {currentPhase === 3 ? "Hardcore Mode" : "Acelerando..."}
          </p>
      </div>

      <button 
        onClick={() => { stopGame(); setGameOver(true); }}
        className="absolute bottom-10 left-10 p-4 rounded-full bg-white/5 border border-white/10 text-white/20 hover:text-white hover:bg-white/10 transition-all z-50"
      >
        <HiArrowLeft className="h-6 w-6" />
      </button>

      <style jsx>{`
        @keyframes flash {
          0% { background: rgba(255,255,255,0.2); }
          100% { background: transparent; }
        }
      `}</style>
    </div>
  )
}
