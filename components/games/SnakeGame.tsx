'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiStar, HiRefresh, HiMusicNote, HiArrowUp, HiArrowDown, HiArrowLeft, HiArrowRight } from 'react-icons/hi'
import { useGameStore } from '@/store/gameStore'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type Point = { x: number; y: number }

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { endGame, addPoints, currentScore } = useGameStore()

  // Game state refs (to avoid re-renders)
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }])
  const foodRef = useRef<Point>({ x: 5, y: 5 })
  const directionRef = useRef<Point>({ x: 1, y: 0 })
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 })
  const speedRef = useRef(150)
  const lastTimeRef = useRef(0)
  const gridCount = 20

  const generateFood = useCallback(() => {
    let newFood: Point
    do {
      newFood = {
        x: Math.floor(Math.random() * gridCount),
        y: Math.floor(Math.random() * gridCount)
      }
    } while (snakeRef.current.some(p => p.x === newFood.x && p.y === newFood.y))
    foodRef.current = newFood
  }, [])

  const playNote = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440 + (score * 20), audioCtx.currentTime) // Note pitch increases with score
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.1)
    } catch (e) {
      // Silence if audio ctx fails
    }
  }

  const loop = useCallback((time: number) => {
    if (gameOver) return
    
    if (time - lastTimeRef.current > speedRef.current) {
      lastTimeRef.current = time
      
      directionRef.current = nextDirectionRef.current
      const head = snakeRef.current[0]
      const newHead = {
        x: (head.x + directionRef.current.x + gridCount) % gridCount,
        y: (head.y + directionRef.current.y + gridCount) % gridCount
      }

      // Check collision
      if (snakeRef.current.some(p => p.x === newHead.x && p.y === newHead.y)) {
        setGameOver(true)
        endGame('snake')
        saveFinalScore()
        return
      }

      const newSnake = [newHead, ...snakeRef.current]

      // Check food
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore(prev => {
           const newScore = prev + 1
           addPoints(10)
           return newScore
        })
        playNote()
        generateFood()
        speedRef.current = Math.max(80, 150 - (score * 2))
      } else {
        newSnake.pop()
      }

      snakeRef.current = newSnake
      draw()
    }

    requestAnimationFrame(loop)
  }, [gameOver, score, endGame, addPoints, generateFood])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width / gridCount

    // Clear
    ctx.fillStyle = '#090909'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grid (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    for (let i = 0; i <= gridCount; i++) {
       ctx.beginPath(); ctx.moveTo(i * size, 0); ctx.lineTo(i * size, canvas.height); ctx.stroke()
       ctx.beginPath(); ctx.moveTo(0, i * size); ctx.lineTo(canvas.width, i * size); ctx.stroke()
    }

    // Food
    ctx.shadowBlur = 15
    ctx.shadowColor = '#1DB954'
    ctx.fillStyle = '#1DB954'
    ctx.beginPath()
    ctx.arc(foodRef.current.x * size + size/2, foodRef.current.y * size + size/2, size/3, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Snake
    snakeRef.current.forEach((p, i) => {
        const opacity = Math.max(0.3, 1 - (i / snakeRef.current.length) * 0.7)
        ctx.fillStyle = `rgba(30, 215, 96, ${opacity})`
        
        // Rounded head or body
        const radius = i === 0 ? 8 : 4
        const x = p.x * size + 2
        const y = p.y * size + 2
        const w = size - 4
        const h = size - 4
        
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, radius)
        ctx.fill()
        
        if (i === 0) {
            // Eyes
            ctx.fillStyle = 'white'
            ctx.beginPath()
            ctx.arc(x + w/4, y + h/3, 2, 0, Math.PI * 2); ctx.fill()
            ctx.beginPath()
            ctx.arc(x + 3*w/4, y + h/3, 2, 0, Math.PI * 2); ctx.fill()
        }
    })
  }

  const handleKey = useCallback((e: KeyboardEvent) => {
    const { key } = e
    const current = directionRef.current
    if ((key === 'ArrowUp' || key === 'w') && current.y !== 1) nextDirectionRef.current = { x: 0, y: -1 }
    if ((key === 'ArrowDown' || key === 's') && current.y !== -1) nextDirectionRef.current = { x: 0, y: 1 }
    if ((key === 'ArrowLeft' || key === 'a') && current.x !== 1) nextDirectionRef.current = { x: -1, y: 0 }
    if ((key === 'ArrowRight' || key === 'd') && current.x !== -1) nextDirectionRef.current = { x: 1, y: 0 }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    const frameId = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('keydown', handleKey)
      cancelAnimationFrame(frameId)
    }
  }, [handleKey, loop])

  const saveFinalScore = async () => {
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        body: JSON.stringify({
          gameId: 'snake',
          songId: 'musical-snake-v1',
          score: currentScore
        })
      })
    } catch (e) {
      console.error('Failed to save score', e)
    }
 }

  // Mobile controls swipe handling
  const touchStartRef = useRef<Point | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    const absX = Math.abs(dx); const absY = Math.abs(dy)
    if (Math.max(absX, absY) > 30) {
        const current = directionRef.current
        if (absX > absY) {
            if (dx > 0 && current.x !== -1) nextDirectionRef.current = { x: 1, y: 0 }
            else if (dx < 0 && current.x !== 1) nextDirectionRef.current = { x: -1, y: 0 }
        } else {
            if (dy > 0 && current.y !== -1) nextDirectionRef.current = { x: 0, y: 1 }
            else if (dy < 0 && current.y !== 1) nextDirectionRef.current = { x: 0, y: -1 }
        }
    }
    touchStartRef.current = null
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 flex flex-col items-center">
      {/* HUD */}
      <div className="flex justify-between items-center mb-8 w-full px-4">
        <div className="bg-white/5 rounded-full px-6 py-2 border border-white/10 flex items-center gap-2">
            <HiStar className="h-5 w-5 text-yellow-500" />
            <span className="text-xl font-black text-white">{currentScore.toLocaleString()}</span>
        </div>
        <div className="text-spotify-text font-black tracking-widest uppercase text-xs">
            NOTAS: {score}
        </div>
      </div>

      <div 
        className="relative group rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas 
            ref={canvasRef} 
            width={400} 
            height={400} 
            className="w-full h-auto aspect-square bg-black shadow-inner"
        />
        
        <AnimatePresence>
            {gameOver && (
                <motion.div 
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-8"
                >
                    <HiMusicNote className="h-16 w-16 text-spotify-green mb-4 animate-bounce" />
                    <h2 className="text-4xl font-black text-white mb-2 italic tracking-tighter">GAME OVER</h2>
                    <p className="text-spotify-text mb-8">A música parou...</p>
                    <div className="flex gap-4">
                        <Button variant="primary" onClick={() => window.location.reload()}>
                            TENTAR DE NOVO
                        </Button>
                        <Button variant="ghost" onClick={() => window.history.back()}>
                            VOLTAR
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Mobile Controls Helper */}
      <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <Button variant="ghost" onClick={() => nextDirectionRef.current = { x: 0, y: -1 }}><HiArrowUp /></Button>
          <div />
          <Button variant="ghost" onClick={() => nextDirectionRef.current = { x: -1, y: 0 }}><HiArrowLeft /></Button>
          <Button variant="ghost" onClick={() => nextDirectionRef.current = { x: 0, y: 1 }}><HiArrowDown /></Button>
          <Button variant="ghost" onClick={() => nextDirectionRef.current = { x: 1, y: 0 }}><HiArrowRight /></Button>
      </div>

      <p className="mt-8 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] hidden md:block">
          USE AS SETAS DO TECLADO PARA MOVER
      </p>
    </div>
  )
}
