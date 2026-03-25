import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GameState {
  currentScore: number
  highScores: Record<string, number> // gameId -> score
  isPlaying: boolean
  round: number
  totalRounds: number
  
  // Actions
  startGame: (totalRounds?: number) => void
  endGame: (gameId: string) => void
  addPoints: (points: number) => void
  nextRound: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentScore: 0,
      highScores: {},
      isPlaying: false,
      round: 1,
      totalRounds: 10,

      startGame: (totalRounds = 10) => set({ 
        isPlaying: true, 
        currentScore: 0, 
        round: 1,
        totalRounds 
      }),

      endGame: (gameId: string) => {
        const { currentScore, highScores } = get()
        const prevBest = highScores[gameId] || 0
        const newBest = Math.max(prevBest, currentScore)
        
        set({ 
          isPlaying: false,
          highScores: { ...highScores, [gameId]: newBest }
        })
      },

      addPoints: (points: number) => set((state) => ({ 
        currentScore: state.currentScore + points 
      })),

      nextRound: () => set((state) => ({ 
        round: Math.min(state.round + 1, state.totalRounds) 
      })),

      resetGame: () => set({ 
        currentScore: 0, 
        round: 1, 
        isPlaying: false 
      }),
    }),
    {
      name: 'soundlink-game-storage',
    }
  )
)
