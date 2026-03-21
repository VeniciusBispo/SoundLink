import { create } from 'zustand'

interface PianoState {
  isPlaying: boolean
  currentScore: number
  setIsPlaying: (playing: boolean) => void
  addScore: (score: number) => void
  resetScore: () => void
}

export const usePianoStore = create<PianoState>((set) => ({
  isPlaying: false,
  currentScore: 0,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  addScore: (score) => set((state) => ({ currentScore: state.currentScore + score })),
  resetScore: () => set({ currentScore: 0 }),
}))
