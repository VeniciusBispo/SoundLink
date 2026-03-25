'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCheck, HiX, HiStar, HiRefresh, HiMusicNote, HiChevronRight } from 'react-icons/hi'
import { useGameStore } from '@/store/gameStore'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

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

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/games/lyrics')
      const data = await res.json()
      setQuestions(data)
      startGame(data.length)
    } catch (error) {
      console.error('Failed to fetch questions', error)
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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-spotify-green border-t-transparent" />
        <p className="font-bold text-white/50 animate-pulse">CARREGANDO LETRAS...</p>
      </div>
    )
  }

  if (gameOver) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-[60vh] flex-col items-center justify-center text-center p-8 bg-white/5 rounded-[40px] border border-white/10"
      >
        <HiStar className="h-20 w-20 text-blue-400 mb-6 drop-shadow-[0_0_30px_rgba(96,165,250,0.4)]" />
        <h2 className="text-4xl font-black text-white mb-2 italic">POETA MUSICAL!</h2>
        <p className="text-spotify-text text-lg mb-8">Sua pontuação final em Complete a Letra</p>
        <div className="text-7xl font-black text-spotify-green mb-10 tracking-tighter">
          {currentScore.toLocaleString()}
        </div>
        <div className="flex gap-4">
            <Button variant="primary" onClick={() => window.location.reload()} size="lg" className="px-10">
                <HiRefresh className="mr-2 h-5 w-5" /> JOGAR NOVAMENTE
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()} size="lg">
                VOLTAR
            </Button>
        </div>
      </motion.div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const parts = currentQuestion.text.split('___')

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* HUD */}
      <div className="flex justify-between items-center mb-12">
        <div className="bg-white/5 rounded-full px-6 py-2 border border-white/10 flex items-center gap-4">
            <div className="flex items-center gap-2">
                <HiStar className="h-5 w-5 text-yellow-500" />
                <span className="text-xl font-black text-white">{currentScore.toLocaleString()}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                RODADA {round}/{totalRounds}
            </span>
        </div>
        
        <div className="flex items-center gap-2 text-spotify-green">
            <HiMusicNote className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-widest truncate max-w-[200px]">
                {currentQuestion.song}
            </span>
        </div>
      </div>

      <div className="relative mb-20">
        <div className="p-12 md:p-16 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-[48px] border border-white/10 shadow-3xl text-center">
            <h2 className="text-3xl md:text-5xl font-medium text-white italic leading-relaxed tracking-tight">
                "{parts[0]}
                <span className={cn(
                    "relative inline-block mx-2 px-4 py-1 rounded-xl transition-all duration-300",
                    isAnswered 
                        ? (isCorrect ? "bg-spotify-green text-black" : "bg-red-500 text-white")
                        : "bg-white/10 text-white/20 border-b-4 border-white/5 min-w-[120px]"
                )}>
                    {isAnswered ? selectedOption : "____"}
                </span>
                {parts[1]}"
            </h2>
            <p className="mt-8 text-spotify-text font-bold uppercase tracking-[0.3em] text-[10px] opacity-40">
                {currentQuestion.artist}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedOption === option
          const isCorrectOption = option === currentQuestion.gap
          
          let stateClass = "bg-white/5 border-white/5 hover:bg-white/10"
          if (isAnswered) {
             if (isCorrectOption) stateClass = "bg-spotify-green/20 border-spotify-green text-spotify-green"
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
                 "flex items-center justify-between p-7 rounded-[32px] border-2 text-left transition-all duration-300",
                 stateClass
               )}
            >
              <span className="text-xl font-bold">{option}</span>
              {isAnswered && isCorrectOption && <HiCheck className="h-6 w-6 text-spotify-green" />}
              {isAnswered && isSelected && !isCorrectOption && <HiX className="h-6 w-6 text-red-500" />}
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
                    isCorrect ? "bg-spotify-green text-black" : "bg-red-500 text-white"
                )}>
                    {isCorrect ? "✨ VOCÊ É UM POETA!" : "💔 QUASE LÁ!"}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
