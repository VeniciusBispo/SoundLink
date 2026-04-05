'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiStar, HiUser, HiClock, HiFire, HiTrash, HiUserGroup } from 'react-icons/hi'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface Score {
  username: string
  score: number
  createdAt: string
}

interface LeaderboardProps {
  gameId: string
  songId: string
  onReset?: () => void
}

export default function GameLeaderboard({ gameId, songId, onReset }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([])
  const [personalBest, setPersonalBest] = useState(0)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  // @ts-ignore - session user role exists in our custom schema
  const isAdmin = session?.user?.role === 'ADMIN'

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/games/leaderboard?gameId=${gameId}&songId=${songId}`)
      const data = await res.json()
      setScores(data.global || [])
      setPersonalBest(data.personalBest || 0)
    } catch (error) {
      console.error('Failed to fetch leaderboard', error)
    } finally {
      setLoading(false)
    }
  }

  const resetRankings = async () => {
    if (!confirm('Tem certeza que deseja resetar TODOS os rankings deste jogo?')) return
    
    try {
      const res = await fetch('/api/admin/reset-rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      })
      
      if (res.ok) {
        fetchLeaderboard()
        if (onReset) onReset()
      }
    } catch (error) {
      console.error('Failed to reset rankings', error)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [gameId, songId])

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-brand-primary/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-primary/20 rounded-2xl text-brand-primary">
            <HiUserGroup className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Ranking Global</h3>
            <p className="text-xs font-bold text-white/40 tracking-widest uppercase mt-0.5">Top 10 Jogadores</p>
          </div>
        </div>

        {isAdmin && (
          <button 
            onClick={resetRankings}
            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
            title="Resetar Ranking (Admin)"
          >
            <HiTrash className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            <p className="text-[10px] font-black text-white/20 tracking-[0.3em] uppercase">Sincronizando placar...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scores.length > 0 ? (
              scores.map((score, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    i === 0 ? "bg-white/10 border-brand-primary/30" : "bg-white/[0.02] border-white/5",
                    score.username === session?.user?.name && "ring-1 ring-brand-primary"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "w-8 text-xl font-black italic text-center",
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-white/20"
                    )}>
                      #{i + 1}
                    </span>
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/10 overflow-hidden">
                      <HiUser className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-white truncate max-w-[150px]">{score.username}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">
                        {new Date(score.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-brand-primary tracking-tighter">{score.score.toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1">
                      <HiFire className="h-3 w-3 text-orange-500" />
                      <span className="text-[9px] font-black text-white/20 uppercase">Recorde</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-white/20 font-bold uppercase tracking-widest text-sm italic">Nenhum score registrado ainda.</p>
                <p className="text-white/10 text-xs mt-2 italic">Seja o primeiro a dominar este ranking!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {session && (
        <div className="p-6 bg-white/[0.02] border-t border-white/5">
          <div className="flex items-center justify-between px-6 py-4 bg-brand-primary/10 rounded-2xl border border-brand-primary/20">
            <div className="flex items-center gap-3">
              <HiStar className="h-6 w-6 text-brand-primary" />
              <span className="text-sm font-black text-white/60 uppercase tracking-widest italic">Seu Melhor Ritmo</span>
            </div>
            <span className="text-3xl font-black text-brand-primary tracking-tighter">{personalBest.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
