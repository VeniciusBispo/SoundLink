'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlay, HiCheck, HiX, HiClock, HiStar, HiRefresh, HiArrowRight, HiMusicNote } from 'react-icons/hi'
import BlindTestPlayer from './BlindTestPlayer'
import { useGameStore } from '@/store/gameStore'
import { cn } from '@/lib/utils'
import GameLeaderboard from './GameLeaderboard'
import AdZone from '@/components/ads/AdZone'

interface Question {
  correctId: string
  youtubeVideoId: string
  startTime: number
  options: {
    id: string
    title: string
    channel: string
    youtubeVideoId: string
  }[]
}

export default function BlindTestGame() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState(10)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const { startGame, endGame, addPoints, nextRound, currentScore, round, totalRounds } = useGameStore()

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/games/blind-test')
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

  useEffect(() => {
    if (loading || isAnswered || gameOver) return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleAnswer(null) // Time's up
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [loading, isAnswered, gameOver])

  const handleAnswer = (choiceId: string | null) => {
    if (isAnswered) return
    setIsAnswered(true)
    setSelectedId(choiceId)
    
    const currentQuestion = questions[currentIndex]
    const correct = choiceId === currentQuestion.correctId
    setIsCorrect(correct)

    if (correct) {
      // Speed bonus: max 1000 points, min 100
      const points = Math.max(100, Math.floor(100 * timer))
      addPoints(points)
    }

    // Wait 2 seconds and move to next or end
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setTimer(10)
        setIsAnswered(false)
        setSelectedId(null)
        nextRound()
      } else {
        setGameOver(true)
        endGame('blind-test')
        saveFinalScore()
      }
    }, 2000)
  }

  const saveFinalScore = async () => {
     try {
       await fetch('/api/games/score', {
         method: 'POST',
         body: JSON.stringify({
           gameId: 'blind-test',
           songId: 'radar-mixed',
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
        <p className="font-bold text-white/50 animate-pulse">CARREGANDO DESAFIOS...</p>
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
        <HiStar className="h-20 w-20 text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.4)]" />
        <h2 className="text-4xl font-black text-white mb-2 italic uppercase">FIM DE RECITAL!</h2>
        <p className="text-spotify-text text-lg mb-8 uppercase tracking-widest font-bold opacity-40">Sua performance no Blind Test</p>
        <div className="text-7xl font-black text-spotify-green mb-10 tracking-tighter italic">
          {currentScore.toLocaleString()}
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 rounded-full bg-spotify-green px-10 py-4 text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
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
          <GameLeaderboard gameId="blind-test" songId="radar-mixed" onReset={fetchQuestions} />
        </div>
      </motion.div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Top Ad */}
      <AdZone slotId="" format="468x60" className="opacity-40 hover:opacity-100 transition-opacity mb-8" />
      {/* HUD */}
      <div className="flex justify-between items-center mb-10">
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

        <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300",
            timer <= 3 ? "border-red-500 bg-red-500/10 animate-pulse" : "border-white/10 bg-white/5"
        )}>
            <HiClock className={cn("h-6 w-6", timer <= 3 ? "text-red-500" : "text-spotify-green")} />
            <span className={cn("text-2xl font-black min-w-[1.5rem]", timer <= 3 ? "text-red-500" : "text-white")}>
                {timer}s
            </span>
        </div>
      </div>

      <BlindTestPlayer 
        videoId={currentQuestion.youtubeVideoId} 
        startTime={currentQuestion.startTime} 
        duration={10} 
        isPlaying={!isAnswered && !gameOver}
      />

      <div className="relative mb-12">
        <div className="flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-spotify-green/20 to-purple-600/10 flex items-center justify-center border-4 border-white/5 shadow-2xl relative mb-8">
                <div className={cn(
                    "absolute inset-0 rounded-full border-4 border-spotify-green animate-ping opacity-20",
                    isAnswered && "hidden"
                )} />
                <HiMusicNote className="h-20 w-20 text-spotify-green drop-shadow-[0_0_20px_#1ed760]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter max-w-xl line-clamp-2">
                QUAL É A MÚSICA?
            </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedId === option.id
          const isCorrectOption = option.id === currentQuestion.correctId
          
          let stateClass = "bg-white/5 border-white/5 hover:bg-white/10"
          if (isAnswered) {
             if (isCorrectOption) stateClass = "bg-spotify-green/20 border-spotify-green text-spotify-green"
             else if (isSelected) stateClass = "bg-red-500/20 border-red-500 text-red-500"
             else stateClass = "opacity-40 grayscale"
          }

          return (
            <motion.button
               key={option.id}
               initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               disabled={isAnswered}
               onClick={() => handleAnswer(option.id)}
               className={cn(
                 "flex flex-col p-6 rounded-[32px] border-2 text-left transition-all duration-300 group",
                 stateClass
               )}
            >
              <div className="flex justify-between items-start w-full">
                <div>
                   <h3 className="text-lg font-black text-white">{option.title}</h3>
                   <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">{option.channel}</p>
                </div>
                {isAnswered && isCorrectOption && <HiCheck className="h-6 w-6 text-spotify-green" />}
                {isAnswered && isSelected && !isCorrectOption && <HiX className="h-6 w-6 text-red-500" />}
              </div>
            </motion.button>
          )
        })}
      </div>

      {isAnswered && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex justify-center"
        >
            <div className={cn(
                "px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase flex items-center gap-3",
                isCorrect ? "bg-spotify-green text-black" : "bg-red-500 text-white"
            )}>
                {isCorrect ? (
                    <>🚀 EXCELENTE! VOCE ACERTOU</>
                ) : (
                    <>💥 OPS! NÃO FOI DESSA VEZ</>
                )}
            </div>
        </motion.div>
      )}
    </div>
  )
}
