'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCheck, HiX, HiStar, HiRefresh, HiMusicNote, HiChevronRight } from 'react-icons/hi'
import { useGameStore } from '@/store/gameStore'
import { cn } from '@/lib/utils'
import GameLeaderboard from './GameLeaderboard'
import AdZone from '@/components/ads/AdZone'

interface LyricsQuestion {
  id: string
  text: string
  gap: string
  options: string[]
  song: string
  artist: string
}

export default function LyricsGame() {
  const [questions, setQuestions] = useState<LyricsQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const { startGame, endGame, addPoints, nextRound, currentScore, round, totalRounds } = useGameStore()

  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/games/lyrics')
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized')
        throw new Error('Falha ao carregar letras')
      }
      const data = await res.json()
      setQuestions(data)
      startGame(data.length)
    } catch (error: any) {
      console.error('Failed to fetch questions', error)
      setError(error.message === 'Unauthorized' ? 'Você precisa estar logado para jogar' : error.message)
    } finally {
      setLoading(false)
    }
  }, [startGame])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleAnswer = (option: string) => {
    if (isAnswered) return
    setIsAnswered(true)
    setSelectedOption(option)
    
    const correct = option === questions[currentIndex].gap
    setIsCorrect(correct)

    if (correct) {
      addPoints(10) // Fixed score for this game
    }

    // Wait and move
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setIsAnswered(false)
        setSelectedOption(null)
        nextRound()
      } else {
        setGameOver(true)
        endGame('complete-lyrics')
        saveFinalScore()
      }
    }, 2000)
  }

  const saveFinalScore = async () => {
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 'complete-lyrics',
          songId: 'curated-lyrics',
          score: currentScore
        })
      })
    } catch (e) {
      console.error('Failed to save score', e)
    }
 }

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
        <p className="font-bold text-white/50 animate-pulse">CARREGANDO LETRAS...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
        <HiX className="h-16 w-16 text-red-500 opacity-20" />
        <div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase">OPS! ALGO DEU ERRADO</h2>
            <p className="text-brand-text font-bold opacity-60 uppercase tracking-widest text-sm">{error}</p>
        </div>
        <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all uppercase text-xs tracking-widest"
        >
            Tentar Novamente
        </button>
      </div>
    )
  }

  if (gameOver) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[80vh] flex-col items-center justify-center text-center p-8 bg-white/5 rounded-[40px] border border-white/10 overflow-y-auto"
      >
        <HiStar className="h-20 w-20 text-blue-400 mb-6 drop-shadow-[0_0_30px_rgba(96,165,250,0.4)]" />
        <h2 className="text-4xl font-black text-white mb-2 italic uppercase">POETA MUSICAL!</h2>
        <p className="text-brand-text text-lg mb-8 uppercase tracking-widest font-bold opacity-40">Sua performance em Complete a Letra</p>
        <div className="text-7xl font-black text-brand-primary mb-10 tracking-tighter italic">
          {currentScore.toLocaleString()}
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 rounded-full bg-brand-primary px-10 py-4 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
                <HiRefresh className="h-6 w-6" /> JOGAR NOVAMENTE
            </button>
            <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 rounded-full border-2 border-white/20 px-10 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10"
            >
                VOLTAR
            </button>
        </div>

        {/* Ad Slot */}
        <AdZone slotId="" format="468x60" className="opacity-80 mb-8" />

        {/* Ranking */}
        <div className="w-full max-w-2xl">
          <GameLeaderboard gameId="complete-lyrics" songId="curated-lyrics" onReset={fetchQuestions} />
        </div>
      </motion.div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <HiMusicNote className="h-12 w-12 text-white/20" />
        <p className="font-bold text-white/50">NENHUMA LETRA ENCONTRADA...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  if (!currentQuestion) return null

  const parts = currentQuestion.text.split('___')

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-8 px-2 sm:px-4 flex flex-col h-full overflow-y-auto">
      {/* Top Ad */}
      <div className="hidden sm:block">
        <AdZone slotId="" format="468x60" className="opacity-40 hover:opacity-100 transition-opacity mb-8" />
      </div>
      {/* HUD */}
      <div className="flex justify-between items-center mb-4 sm:mb-12 px-2">
        <div className="bg-white/5 rounded-full px-3 sm:px-6 py-1 sm:py-2 border border-white/10 flex items-center gap-2 sm:gap-4 font-mono">
            <div className="flex items-center gap-1.5 sm:gap-2">
                <HiStar className="h-3 w-3 sm:h-5 sm:h-5 text-yellow-500" />
                <span className="text-sm sm:text-xl font-black text-white">{currentScore.toLocaleString()}</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[9px] sm:text-xs font-bold text-white/50 uppercase tracking-widest whitespace-nowrap">
                {round}/{totalRounds}
            </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-brand-primary max-w-[120px] sm:max-w-none">
            <HiMusicNote className="h-3 w-3 sm:h-5 sm:h-5 flex-shrink-0" />
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest truncate">
                {currentQuestion.song}
            </span>
        </div>
      </div>

      <div className="relative mb-6 sm:mb-20">
        <div className="p-6 sm:p-16 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[24px] sm:rounded-[48px] border border-white/10 shadow-3xl text-center">
            <h2 className="text-lg sm:text-4xl md:text-5xl font-medium text-white italic leading-relaxed tracking-tight">
                "{parts[0]}
                <span className={cn(
                    "relative inline-block mx-1 sm:mx-2 px-2 sm:px-4 py-0 sm:py-1 rounded-lg sm:rounded-xl transition-all duration-300",
                    isAnswered 
                        ? (isCorrect ? "bg-brand-primary text-black" : "bg-red-500 text-white")
                        : "bg-white/10 text-white/20 border-b-2 sm:border-b-4 border-white/5 min-w-[50px] sm:min-w-[120px]"
                )}>
                    {isAnswered ? selectedOption : "____"}
                </span>
                {parts[1]}"
            </h2>
            <p className="mt-2 sm:mt-8 text-brand-text font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[7px] sm:text-[10px] opacity-40">
                {currentQuestion.artist}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 px-2">
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedOption === option
          const isCorrectOption = option === currentQuestion.gap
          
          let stateClass = "bg-white/5 border-white/5 hover:bg-white/10"
          if (isAnswered) {
             if (isCorrectOption) stateClass = "bg-brand-primary/20 border-brand-primary text-brand-primary"
             else if (isSelected) stateClass = "bg-red-500/20 border-red-500 text-red-500"
             else stateClass = "opacity-40 grayscale"
          }

          return (
            <motion.button
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               disabled={isAnswered}
               onClick={() => handleAnswer(option)}
               className={cn(
                 "flex items-center justify-between p-4 sm:p-7 rounded-2xl sm:rounded-[32px] border-2 text-left transition-all duration-300",
                 stateClass
               )}
            >
              <span className="text-base sm:text-xl font-bold">{option}</span>
              {isAnswered && isCorrectOption && <HiCheck className="h-5 w-5 sm:h-6 sm:h-6 text-brand-primary" />}
              {isAnswered && isSelected && !isCorrectOption && <HiX className="h-5 w-5 sm:h-6 sm:h-6 text-red-500" />}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {isAnswered && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-12 flex justify-center"
            >
                <div className={cn(
                    "px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase flex items-center gap-3 shadow-xl",
                    isCorrect ? "bg-brand-primary text-black" : "bg-red-500 text-white"
                )}>
                    {isCorrect ? "✨ VOCÊ É UM POETA!" : "💔 QUASE LÁ!"}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
