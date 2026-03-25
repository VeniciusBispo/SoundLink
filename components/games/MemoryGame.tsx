'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiStar, HiRefresh, HiCheck, HiMusicNote, HiHashtag } from 'react-icons/hi'
import { useGameStore } from '@/store/gameStore'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface MemoryCard {
  id: string
  pairId: string
  type: 'title' | 'artist'
  content: string
  secondary: string
  image: string
}

export default function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flipped, setFlipped] = useState<string[]>([])
  const [solved, setSolved] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const { startGame, endGame, addPoints, currentScore } = useGameStore()

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/games/memory')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setCards(data)
        startGame(data.length / 2)
      } else {
        console.error('Invalid memory cards data', data)
        setCards([])
      }
      
      setFlipped([])
      setSolved([])
      setAttempts(0)
    } catch (error) {
      console.error('Failed to fetch cards', error)
    } finally {
      setLoading(false)
    }
  }, [startGame])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const handleCardClick = (card: MemoryCard) => {
    if (loading || flipped.includes(card.id) || solved.includes(card.id) || flipped.length >= 2) return

    const newFlipped = [...flipped, card.id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setAttempts(prev => prev + 1)
      const firstCard = cards.find(c => c.id === newFlipped[0])
      const secondCard = card

      if (firstCard?.pairId === secondCard.pairId) {
        setSolved(prev => [...prev, firstCard.id, secondCard.id])
        setFlipped([])
        addPoints(100) // Points per match

        // Check for win
        if (solved.length + 2 === cards.length) {
          setTimeout(() => {
            setGameOver(true)
            endGame('memory')
            saveFinalScore()
          }, 1000)
        }
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  const saveFinalScore = async () => {
     try {
       await fetch('/api/games/score', {
         method: 'POST',
         body: JSON.stringify({
           gameId: 'memory',
           songId: 'musical-memory-classic',
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
        <p className="font-bold text-white/50 animate-pulse">EMBARALHANDO CARTAS...</p>
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
        <h2 className="text-4xl font-black text-white mb-2 italic">MÉMORIA AFIDADA!</h2>
        <p className="text-spotify-text text-lg mb-8">Pares encontrados em {attempts} tentativas.</p>
        <div className="text-7xl font-black text-spotify-green mb-10 tracking-tighter">
          {currentScore.toLocaleString()}
        </div>
        <div className="flex gap-4">
            <Button variant="primary" onClick={() => window.location.reload()} size="lg" className="px-10">
                <HiRefresh className="mr-2 h-5 w-5" /> RECOMEÇAR
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()} size="lg">
                VOLTAR
            </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* HUD */}
      <div className="flex justify-between items-center mb-10">
        <div className="bg-white/5 rounded-full px-6 py-2 border border-white/10 flex items-center gap-4">
            <div className="flex items-center gap-2">
                <HiStar className="h-5 w-5 text-yellow-500" />
                <span className="text-xl font-black text-white">{currentScore.toLocaleString()}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
                <HiHashtag className="h-4 w-4 text-white/40" />
                <span className="text-sm font-bold text-white/50 uppercase tracking-widest">
                    Tentativas: {attempts}
                </span>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card) => (
          <MemoryCardComponent
             key={card.id}
             card={card}
             isFlipped={flipped.includes(card.id) || solved.includes(card.id)}
             isSolved={solved.includes(card.id)}
             onClick={() => handleCardClick(card)}
          />
        ))}
      </div>
    </div>
  )
}

function MemoryCardComponent({ card, isFlipped, isSolved, onClick }: { card: MemoryCard, isFlipped: boolean, isSolved: boolean, onClick: () => void }) {
  return (
    <div 
        className="aspect-square perspective-1000 cursor-pointer group"
        onClick={onClick}
    >
        <motion.div
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full h-full preserve-3d"
        >
            {/* Front (Verso da carta) */}
            <div className="absolute inset-0 backface-hidden bg-spotify-card border-2 border-white/5 rounded-3xl flex items-center justify-center p-6 group-hover:border-white/10 transition-colors">
                 <HiMusicNote className="h-10 w-10 text-white/20 group-hover:text-spotify-green transition-colors" />
            </div>

            {/* Back (Conteúdo da carta) */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.04] border-2 border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 text-center rotate-y-180 overflow-hidden">
                <div className={cn(
                    "absolute inset-0 bg-cover bg-center opacity-10 blur-sm scale-110",
                    isSolved && "opacity-20"
                )} style={{ backgroundImage: `url(${card.image})` }} />
                
                <div className="relative z-10 flex flex-col items-center gap-2">
                    {card.type === 'title' ? (
                        <>
                            <p className="text-[10px] font-black uppercase text-spotify-green tracking-widest mb-1">MÚSICA</p>
                            <h3 className="text-sm md:text-base font-black text-white leading-tight line-clamp-3">{card.content}</h3>
                        </>
                    ) : (
                        <>
                            <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-1">ARTISTA</p>
                            <h3 className="text-sm md:text-base font-black text-white leading-tight line-clamp-3">{card.content}</h3>
                        </>
                    )}
                </div>

                {isSolved && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute bottom-2 right-2 bg-spotify-green text-black rounded-full p-1"
                    >
                        <HiCheck className="h-4 w-4" />
                    </motion.div>
                )}
            </div>
        </motion.div>
    </div>
  )
}
