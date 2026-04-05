'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  PerspectiveCamera,
  Stars,
  Grid,
  Float, // Added
  Text, // Added
  ContactShadows // Added
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlay, HiPause, HiRefresh, HiStar, HiClock, HiMusicNote, HiVolumeUp, HiUser, HiFire, HiTrash, HiUserGroup, HiChevronRight } from 'react-icons/hi'
// Removed HiTrophy
import { useGameStore } from '@/store/gameStore'
// Button import removed
import { cn } from '@/lib/utils'
import GameLeaderboard from './GameLeaderboard' // New
import AdZone from '@/components/ads/AdZone' // New

type Point = { x: number; y: number }

// --- 3D COMPONENTS ---

const GRID_SIZE = 20
const CELL_SIZE = 1

function SnakeSegment({ position, isHead, index, total }: { position: THREE.Vector3, isHead: boolean, index: number, total: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Set initial position immediately to avoid jump from origin
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(position)
    }
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(position, 0.45)
    }
  })

  // Vibrant neon colors
  const color = isHead ? '#00FFCC' : '#0066FF'
  const emissiveColor = isHead ? '#00FF88' : '#0033CC'
  const emissiveIntensity = isHead ? 4 : 1
  const scale = (0.95 - (index / total) * 0.5) * (isHead ? 1.2 : 1)

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[CELL_SIZE * scale, CELL_SIZE * scale, CELL_SIZE * scale]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.05}
        metalness={0.9}
      />
      {isHead && (
        <pointLight distance={6} intensity={10} color="#00FF88" position={[0, 1, 0]} />
      )}
    </mesh>
  )
}

function Food({ position }: { position: Point }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.3
      meshRef.current.rotation.y += 0.08
      meshRef.current.rotation.x += 0.04
    }
  })

  const worldX = position.x - GRID_SIZE / 2 + 0.5
  const worldZ = position.y - GRID_SIZE / 2 + 0.5

  return (
    <group position={[worldX, 0, worldZ]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color="#FF0088"
          emissive="#FF0088"
          emissiveIntensity={5}
        />
      </mesh>
      <pointLight distance={8} intensity={15} color="#FF0088" position={[0, 2, 0]} />
    </group>
  )
}

function GameScene({ snake, food, gameOver }: { snake: Point[], food: Point, gameOver: boolean }) {
  const headPos = useMemo(() => new THREE.Vector3(snake[0].x - GRID_SIZE / 2 + 0.5, 0, snake[0].y - GRID_SIZE / 2 + 0.5), [snake])
  
  useFrame((state) => {
    if (!gameOver) {
      // Dynamic High-Authority Camera follow
      const targetCamPos = new THREE.Vector3(headPos.x * 0.4, 18, headPos.z * 0.4 + 14)
      state.camera.position.lerp(targetCamPos, 0.08)
      state.camera.lookAt(0, 0, 0)
    } else {
      state.camera.position.lerp(new THREE.Vector3(0, 30, 0), 0.02)
      state.camera.lookAt(0, 0, 0)
    }
  })

  return (
    <>
      <color attach="background" args={['#010101']} />
      <fogExp2 attach="fog" args={['#000', 0.04]} />
      
      <PerspectiveCamera makeDefault position={[0, 18, 14]} fov={38} />

      <ambientLight intensity={0.5} />
      <spotLight position={[15, 25, 15]} angle={0.2} penumbra={1} intensity={12} castShadow />
      <directionalLight position={[-15, 20, -10]} intensity={3} color="#0055ff" />

      {/* GRID FLOOR PREMIUM - Offset y slightly to prevent flickering (Z-fighting) */}
      <group position={[0, -0.6, 0]}>
        <Grid
          infiniteGrid
          fadeDistance={45}
          sectionSize={1}
          sectionColor="#00FF88"
          cellColor="#001105"
          sectionThickness={3}
          cellThickness={0.5}
          cellSize={1}
          position={[0, 0.01, 0]} 
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#050505" 
            metalness={1} 
            roughness={0.1} 
          />
        </mesh>
      </group>

      {/* SNAKE RENDERING */}
      {snake.map((p, i) => (
        <SnakeSegment
          key={i}
          position={new THREE.Vector3(p.x - GRID_SIZE / 2 + 0.5, 0, p.y - GRID_SIZE / 2 + 0.5)}
          isHead={i === 0}
          index={i}
          total={snake.length}
        />
      ))}

      {/* FOOD RENDERING */}
      <Food position={food} />
      
      <Stars radius={150} depth={60} count={10000} factor={6} saturation={0} fade speed={2} />
    </>
  )
}

// --- MAIN GAME COMPONENT ---

export default function SnakeGame() {
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }])
  const [food, setFood] = useState<Point>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 })
  const [nextDirection, setNextDirection] = useState<Point>({ x: 0, y: -1 })
  const [isPaused, setIsPaused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<'playing' | 'paused' | 'game-over'>('playing') // Added status state

  useEffect(() => {
    setMounted(true)
  }, [])

  const { endGame, addPoints, currentScore } = useGameStore()

  const speed = Math.max(60, 150 - (score * 5))

  // Audio Ref
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playNote = useCallback((idx: number) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const freqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
      osc.frequency.setValueAtTime(freqs[idx % freqs.length] * (Math.floor(idx / 8) + 1), ctx.currentTime)
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 0.6)
    } catch (e) { }
  }, [])

  useEffect(() => {
    if (gameOver || isPaused) return
    const tick = () => {
      setSnake(prev => {
        const head = prev[0]
        const actualDir = nextDirection
        setDirection(actualDir)
        const newHead = {
          x: (head.x + actualDir.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + actualDir.y + GRID_SIZE) % GRID_SIZE
        }
        if (prev.some(p => p.x === newHead.x && p.y === newHead.y)) {
          setGameOver(true)
          setStatus('game-over') // Set status to game-over
          endGame('snake')
          return prev
        }
        const newSnake = [newHead, ...prev]
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1); addPoints(10); playNote(score)
          let nFood: Point
          do {
            nFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) }
          } while (newSnake.some(p => p.x === nFood.x && p.y === nFood.y))
          setFood(nFood)
        } else {
          newSnake.pop()
        }
        return newSnake
      })
    }
    const interval = setInterval(tick, speed)
    return () => clearInterval(interval)
  }, [gameOver, isPaused, nextDirection, food, speed, score, playNote, addPoints, endGame])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowUp' || e.key === 'w') && direction.y !== 1) setNextDirection({ x: 0, y: -1 })
      if ((e.key === 'ArrowDown' || e.key === 's') && direction.y !== -1) setNextDirection({ x: 0, y: 1 })
      if ((e.key === 'ArrowLeft' || e.key === 'a') && direction.x !== 1) setNextDirection({ x: -1, y: 0 })
      if ((e.key === 'ArrowRight' || e.key === 'd') && direction.x !== -1) setNextDirection({ x: 1, y: 0 })
      if (e.key === ' ') {
        setIsPaused(p => !p)
        setStatus(prev => (prev === 'playing' ? 'paused' : 'playing')) // Toggle status
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [direction])

  const resetGame = useCallback(() => {
    setScore(0)
    setSnake([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }])
    setFood({ x: 5, y: 5 })
    setDirection({ x: 0, y: -1 })
    setNextDirection({ x: 0, y: -1 })
    setIsPaused(false)
    setGameOver(false)
    setStatus('playing')
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-brand-primary animate-pulse font-black tracking-widest uppercase text-xs">
          Sincronizando 3D...
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-black overflow-hidden flex flex-col">
      {/* HUD OVERLAY PREMIUM */}
      <div className="absolute top-0 left-0 w-full p-3 sm:p-12 z-20 flex justify-between items-start pointer-events-none">
        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-xl sm:rounded-3xl p-3 sm:p-8 flex items-center gap-3 sm:gap-8 pointer-events-auto shadow-2xl">
          <div className="relative">
            <HiStar className="h-5 w-5 sm:h-10 sm:h-10 text-brand-primary relative z-10 drop-shadow-[0_0_15px_#00FF88]" />
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-brand-primary rounded-full blur-2xl"
            />
          </div>
          <div>
            <div className="text-[8px] sm:text-[12px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase text-white/30">Pontos</div>
            <div className="text-xl sm:text-5xl font-black text-white leading-none tracking-tighter italic">
              {currentScore.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 sm:gap-6 pointer-events-auto">
          {/* Volume Indicator - Hidden on very small mobile if needed, but keeping for now */}
          <div className="hidden xs:flex bg-black/40 backdrop-blur-2xl border border-white/10 rounded-lg sm:rounded-2xl px-3 sm:px-8 py-2 sm:py-5 items-center gap-3 sm:gap-6 shadow-xl">
            <HiVolumeUp className="h-4 w-4 sm:h-8 sm:h-8 text-brand-primary animate-pulse" />
            <div className="h-1.5 w-16 sm:h-2.5 sm:w-48 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary to-emerald-400 shadow-[0_0_20px_#00FF88]"
                animate={{ width: `${Math.min(100, (score / 30) * 100)}%` }}
              />
            </div>
          </div>
          {/* Pause/Play Button */}
          <button
            onClick={() => {
              setIsPaused(p => !p)
              setStatus(prev => (prev === 'playing' ? 'paused' : 'playing'))
            }}
            className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-lg sm:rounded-2xl px-3 sm:px-8 py-2 sm:py-5 flex items-center gap-2 sm:gap-6 shadow-xl transition-colors hover:bg-white/10"
          >
            {isPaused ? (
              <HiPlay className="h-4 w-4 sm:h-8 sm:h-8 text-brand-primary" />
            ) : (
              <HiPause className="h-4 w-4 sm:h-8 sm:h-8 text-brand-primary" />
            )}
            <span className="text-white text-[10px] sm:text-lg font-bold tracking-wider uppercase">
              {isPaused ? 'Resumir' : 'Pausar'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Controls D-PAD */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 md:hidden pointer-events-none select-none">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 pointer-events-auto">
          <div />
          <button 
            onPointerDown={(e) => { e.preventDefault(); if (direction.y !== 1) setNextDirection({ x: 0, y: -1 }) }}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center active:bg-brand-primary active:text-black transition-all shadow-2xl"
          >
            <HiChevronRight className="h-8 w-8 -rotate-90" />
          </button>
          <div />
          
          <button 
            onPointerDown={(e) => { e.preventDefault(); if (direction.x !== 1) setNextDirection({ x: -1, y: 0 }) }}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center active:bg-brand-primary active:text-black transition-all shadow-2xl"
          >
            <HiChevronRight className="h-8 w-8 rotate-180" />
          </button>
          <div className="w-14 h-14 flex items-center justify-center">
            <div className="w-2 h-2 bg-white/20 rounded-full" />
          </div>
          <button 
            onPointerDown={(e) => { e.preventDefault(); if (direction.x !== -1) setNextDirection({ x: 1, y: 0 }) }}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center active:bg-brand-primary active:text-black transition-all shadow-2xl"
          >
            <HiChevronRight className="h-8 w-8" />
          </button>

          <div />
          <button 
            onPointerDown={(e) => { e.preventDefault(); if (direction.y !== -1) setNextDirection({ x: 0, y: 1 }) }}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center active:bg-brand-primary active:text-black transition-all shadow-2xl"
          >
            <HiChevronRight className="h-8 w-8 rotate-90" />
          </button>
          <div />
        </div>
      </div>

      {/* Top Ad Slot */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[468px] hidden md:block opacity-40 hover:opacity-100 transition-opacity">
        <AdZone slotId="" format="468x60" />
      </div>

      {/* 3D CANVAS PORTAL */}
      <div className="flex-1 cursor-grab active:cursor-grabbing">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, stencil: false }}>
          <Suspense fallback={null}>
            <GameScene snake={snake} food={food} gameOver={gameOver} />
          </Suspense>
        </Canvas>
      </div>

      {/* GAME OVER SCREEN */}
      <AnimatePresence>
        {status === 'game-over' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center gap-4 sm:gap-6 max-w-4xl w-full py-8 sm:py-12 px-4"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-brand-primary/20 rounded-xl sm:rounded-2xl text-brand-primary">
                  <HiUserGroup className="h-6 w-6 sm:h-8 sm:h-8" />
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white italic tracking-tighter uppercase">Ritmo Final</h2>
              </div>
              <div className="text-5xl sm:text-7xl font-black text-brand-primary mb-4 sm:mb-8 tracking-tighter italic">
                {currentScore.toLocaleString()}
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 rounded-full bg-brand-primary px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-bold text-black transition-transform hover:scale-105 active:scale-95"
                >
                  <HiRefresh className="h-5 w-5 sm:h-6 sm:h-6" /> JOGAR NOVAMENTE
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 rounded-full border-2 border-white/20 px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-lg font-bold text-white transition-colors hover:bg-white/10"
                >
                  VOLTAR
                </button>
              </div>

              {/* Ad Slot in Game Over */}
              <div className="w-full max-w-[468px] hidden sm:block">
                <AdZone slotId="" format="468x60" className="opacity-80 mb-8" />
              </div>

              {/* Ranking Section */}
              <div className="w-full max-w-2xl">
                <GameLeaderboard gameId="snake" songId="musical-snake-classic" onReset={resetGame} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[12px] font-black tracking-[0.6em] text-white/20 uppercase italic transition-opacity hover:opacity-100">
            Comande o som com as setas
          </p>
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </div>
  )
}

