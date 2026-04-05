'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { PIANO_SONGS, Song, Note } from '@/lib/games/piano/songs'
import { cn } from '@/lib/utils'
import { HiPlay, HiArrowLeft, HiStar, HiUser, HiChevronRight, HiFire, HiBadgeCheck } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'
import GameLeaderboard from '@/components/games/GameLeaderboard'
import AdZone from '@/components/ads/AdZone'

const KEYS = ['s', 'd', 'f', 'g']
const TILE_NOTES = [261.63, 293.66, 329.63, 349.23]
const PHASE_NAMES = ['Fácil', 'Médio', 'Difícil', 'Hardcore']
const PHASE_SPEEDS = [1.0, 1.4, 1.85, 2.3]

interface GameTile extends Note {
  id: string;
  hit: boolean;
  missed: boolean;
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
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  
  const [laneFlashes, setLaneFlashes] = useState<{lane: number, type: 'hit' | 'miss'} | null>(null)
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
      setLeaderboardKey(prev => prev + 1)
    } catch (e) {
      console.error(e)
    }
  }

  const playNote = useCallback((index: number, type: 'hit' | 'miss' = 'hit') => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()

    const osc = audioCtxRef.current.createOscillator()
    const gain = audioCtxRef.current.createGain()
    
    if (type === 'miss') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(110, audioCtxRef.current.currentTime)
      gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.2)
    } else {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(TILE_NOTES[index], audioCtxRef.current.currentTime)
      gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.4)
    }
    
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
        playNote(lane, 'hit')
        triggerFeedback(hitType.toUpperCase() + '!', hitType)
        setLaneFlashes({ lane, type: 'hit' })
        setTimeout(() => setLaneFlashes(null), 100)

        return prev.map((t, idx) => idx === hitIdx ? { ...t, hit: true } : t)
      } else {
        const penalty = Math.min(scoreRef.current, 50)
        scoreRef.current -= penalty
        setScore(scoreRef.current)
        playNote(lane, 'miss')
        triggerFeedback('MISS!', 'miss')
        setLaneFlashes({ lane, type: 'miss' })
        setTimeout(() => setLaneFlashes(null), 150)
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
  }, [isPlaying, gameOver, isVictory, stopGame, selectedSong, currentPhase, saveScore])

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
    setLeaderboardKey(prev => prev + 1)
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

  const currentNow = startTimeRef.current === 0 ? 0 : (performance.now() - startTimeRef.current) / 1000
  const songTitle = selectedSong?.title || ''
  const songDifficulty = selectedSong?.difficulty || 1

  if (!selectedSong || gameOver || isVictory) {
    const hasNextOption = selectedSong && (currentPhase < 3 || PIANO_SONGS.findIndex(s => s.id === selectedSong.id) < PIANO_SONGS.length - 1)
    const isPerfectClear = isVictory && score === maxPossibleScore

    return (
      <div className="flex flex-col items-center gap-12 text-white p-6 overflow-y-auto bg-black min-h-full">
        <AdZone slotId="" className="w-full max-w-5xl" />
        
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-7xl">
            <div className="w-full lg:w-1/2">
                <div className="mb-4 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-brand-primary/20 to-transparent rounded-2xl sm:rounded-[32px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-24 sm:w-40 h-24 sm:h-40 bg-brand-primary/10 blur-[40px] sm:blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                    <h2 className="text-2xl sm:text-4xl font-black mb-1">Piano <span className="text-brand-primary">Pro</span></h2>
                    <p className="text-brand-text text-[10px] sm:text-sm font-medium">Bata o recorde global no ritmo das estrelas.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {PIANO_SONGS.map(song => (
                    <button
                        key={song.id}
                        onClick={() => handleStartRequest(song)}
                        className={cn(
                        "flex items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group",
                        selectedSong?.id === song.id 
                            ? "bg-brand-primary/15 border-brand-primary/50 shadow-[0_15px_40px_-15px_rgba(30,215,96,0.3)]" 
                            : "bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/20"
                        )}
                    >
                        <div className="text-left">
                        <p className="text-base sm:text-lg font-black group-hover:text-brand-primary transition-colors">{song.title}</p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5">
                            <p className="text-[8px] sm:text-[10px] text-brand-text font-black uppercase tracking-[0.2em]">{song.artist}</p>
                            <div className="flex gap-0.5 sm:gap-1 items-center bg-black/40 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className={cn("h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full", i < song.difficulty ? "bg-brand-primary shadow-[0_0_5px_#1ed760]" : "bg-white/10")} />
                            ))}
                            <span className="text-[8px] sm:text-[9px] font-black text-white/40 ml-1">{song.difficulty}</span>
                            </div>
                        </div>
                        </div>
                        <div className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl group-hover:bg-brand-primary group-hover:text-black transition-all">
                            <HiPlay className="h-5 w-5 sm:h-6 sm:h-6" />
                        </div>
                    </button>
                    ))}
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col gap-8">
                {(gameOver || isVictory) && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={cn(
                            "p-6 sm:p-10 rounded-3xl sm:rounded-[40px] text-center shadow-2xl relative overflow-hidden border",
                            isVictory ? "bg-gradient-to-b from-brand-primary/20 to-transparent border-brand-primary/30" : "bg-gradient-to-b from-red-500/20 to-transparent border-red-500/30"
                        )}
                    >
                        <p className={cn(
                            "font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-3",
                            isVictory ? "text-brand-primary" : "text-red-500"
                        )}>
                            {isVictory ? `Concluído: ${PHASE_NAMES[currentPhase]}` : "Sessão Encerrada"}
                        </p>
                        <h2 className="text-xl sm:text-2xl font-black mb-1">{isVictory ? (isPerfectClear ? "Lendário!" : "Parabéns!") : "Quase lá!"}</h2>
                        <div className="my-4 sm:my-8 relative">
                            <p className="text-5xl sm:text-7xl font-black drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] leading-none">{score}</p>
                            {isPerfectClear && <p className="text-[8px] sm:text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1"><HiBadgeCheck /> Perfect Clear</p>}
                        </div>
                        <div className="space-y-3">
                            {isVictory && hasNextOption && (
                                <button onClick={handleNextLevel} className="w-full py-4 sm:py-5 bg-brand-primary text-black rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:translate-y-[-2px] transition-all shadow-lg flex items-center justify-center gap-2">
                                    PRÓXIMO <HiChevronRight className="h-4 w-4 sm:h-5 sm:h-5" />
                                </button>
                            )}
                            <button onClick={() => selectedSong && handleStartRequest(selectedSong, currentPhase)} className="w-full py-4 sm:py-5 bg-white/10 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-white/20 transition-all">
                                RECOMEÇAR
                            </button>
                        </div>
                    </motion.div>
                )}

                {selectedSong && (
                    <div key={leaderboardKey}>
                        <GameLeaderboard gameId="piano" songId={selectedSong.id} />
                    </div>
                )}
            </div>
        </div>

        <AdZone slotId="" className="w-full max-w-5xl" />
      </div>
    )
  }

  return (
    <div className="relative flex-1 flex flex-col items-center justify-end overflow-hidden bg-[#020202] select-none cursor-crosshair">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />
      <div className="flex w-full h-full max-w-xl mx-auto border-x border-white/[0.08] relative">
        {[0, 1, 2, 3].map(lane => {
          // BIT-LEVEL OPTIMIZATION: Sliding Window Rendering
          // Only process tiles that are within a visible time window
          const visibleTiles = tiles.filter(t => 
            t.lane === lane && 
            !t.hit && 
            !t.missed &&
            t.time + START_DELAY >= currentNow - 0.5 && 
            t.time + START_DELAY <= currentNow + 2.5
          )

          return (
            <div 
              key={lane} 
              className="flex-1 relative h-full flex flex-col justify-end"
              onPointerDown={() => handleHit(lane)}
            >
              <AnimatePresence mode="popLayout">
                  {laneFlashes?.lane === lane && (
                      <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: laneFlashes.type === 'miss' ? 0.3 : 0.15 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                             "absolute inset-0",
                             laneFlashes.type === 'miss' ? "bg-red-500" : "bg-white"
                          )}
                      />
                  )}
              </AnimatePresence>
              <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/[0.03]" />
              {visibleTiles.map(t => {
                  const top = getTilePos(t.time, currentNow)
                  return (
                      <div 
                          key={t.id}
                          className={cn(
                              "absolute left-[5%] sm:left-[8%] right-[5%] sm:right-[8%] h-32 sm:h-40 rounded-2xl sm:rounded-[32px] shadow-2xl",
                              "bg-gradient-to-br from-white via-[#f0f0f0] to-[#ddd] border-2 border-white/20",
                              "after:absolute after:inset-2 sm:after:inset-4 after:border after:border-black/5 after:rounded-xl sm:after:rounded-[24px]"
                          )}
                          style={{ top: `calc(${top}% - 128px)` }}
                      />
                  )
              })}
              <div className="h-[15%] w-full flex items-center justify-center border-t border-white/[0.05] relative bg-white/[0.01]">
                  <span className="text-white/10 font-black text-2xl sm:text-5xl font-mono">{KEYS[lane]}</span>
              </div>
            </div>
          )
        })}
        <div className="absolute top-[85%] left-0 right-0 h-[2px] bg-brand-primary shadow-[0_0_25px_#1ed760] z-20 pointer-events-none opacity-80" />
      </div>

      <div className="absolute bottom-[35%] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30 h-16 sm:h-20">
        <AnimatePresence mode="wait">
            {feedbacks.map(f => (
                <motion.div
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1.2, y: -20 }}
                    exit={{ opacity: 0, y: -40 }}
                    className={cn(
                        "text-xl sm:text-3xl font-black italic tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]",
                        f.type === 'perfect' ? "text-yellow-400" : f.type === 'great' ? "text-blue-400" : (f.type === 'miss' ? "text-red-500 scale-125" : "text-white")
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
                <span className="text-[1.5rem] sm:text-[3rem] font-black text-brand-primary uppercase tracking-[0.3em] mb-[-2rem] sm:mb-[-4rem] opacity-50 italic">
                    {PHASE_NAMES[currentPhase]}
                </span>
                <span className="text-[8rem] sm:text-[15rem] font-black text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] italic tracking-tighter">
                    {countdown === 0 ? 'GO!' : countdown}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW RESPONSIVE HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-12 flex justify-between items-start pointer-events-none z-40">
        <div className="flex flex-col">
            <p className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] sm:tracking-[0.5em] mb-1 sm:mb-2 font-mono">
                SCORE • {PHASE_NAMES[currentPhase]}
            </p>
            <div className="flex items-baseline gap-2 sm:gap-4">
              <motion.p 
                  key={score}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "text-4xl sm:text-8xl font-black tracking-tighter tabular-nums leading-none transition-colors",
                    score < 0 ? "text-red-500" : "text-white"
                  )}
              >
                  {score}
              </motion.p>
              {selectedSong && <p className="text-xs sm:text-xl font-black text-white/20 tracking-tighter tabular-nums">/ {maxPossibleScore}</p>}
            </div>
        </div>

        <div className="text-right flex flex-col items-end">
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <p className="text-[8px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.3em] sm:tracking-[0.5em]">LEVEL {songDifficulty}</p>
              {currentPhase > 0 && (
                  <div className="flex gap-0.5">
                      {Array.from({ length: currentPhase }).map((_, i) => (
                          <HiFire key={i} className="text-orange-500 h-2 w-2 sm:h-3 sm:w-3 animate-pulse" />
                      ))}
                  </div>
              )}
            </div>
            <p className="text-sm sm:text-2xl font-black text-white truncate max-w-[120px] sm:max-w-[300px]">{songTitle}</p>
            <p className={cn(
              "text-[8px] sm:text-xs font-black uppercase tracking-widest mt-0.5 sm:mt-1 italic",
              currentPhase === 3 ? "text-red-500 animate-pulse" : "text-brand-primary"
            )}>
              {currentPhase === 3 ? "Hardcore" : "Acelerando..."}
            </p>
        </div>
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
