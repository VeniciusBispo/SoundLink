'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiLightningBolt, HiMusicNote, HiRefresh, HiPlay, HiPlus, HiEmojiHappy, HiCheck, HiChevronDown } from 'react-icons/hi'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { usePlayerStore } from '@/store/playerStore'
import { getMyPlaylists, addSongToPlaylist } from '@/services/playlistService'
import type { Playlist } from '@/types'

interface Recommendation {
  videoId: string
  title: string
  thumbnail: string
  channel: string
  duration: number
  reason: string
}

export default function RadarPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([])
  const [activeSaveId, setActiveSaveId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<string | null>(null) // videoId-playlistId
  
  const playSong = usePlayerStore((s) => s.playSong)

  const fetchRadar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/radar')
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Falha ao radar')
      
      setRecommendations(data)
      
      // Also fetch user playlists
      const playlists = await getMyPlaylists()
      setMyPlaylists(playlists)
    } catch (err: any) {
      setError(err.message || 'Não conseguimos escanear seu gosto agora. Tente de novo!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRadar()
  }, [])

  const handlePlay = (rec: Recommendation) => {
    playSong({
      id: rec.videoId, // Temporary ID for song model
      youtubeVideoId: rec.videoId,
      title: rec.title,
      channel: rec.channel,
      thumbnail: rec.thumbnail,
      duration: rec.duration,
    })
  }

  const handleSaveToPlaylist = async (rec: Recommendation, playlistId: string) => {
    const saveKey = `${rec.videoId}-${playlistId}`
    setIsSaving(saveKey)
    try {
      await addSongToPlaylist(playlistId, {
        youtubeVideoId: rec.videoId,
        title: rec.title,
        duration: rec.duration,
        thumbnail: rec.thumbnail,
        channel: rec.channel
      })
      setActiveSaveId(null)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsSaving(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black p-6 md:p-10 scrollbar-hide relative min-h-full">
      
      {/* ── Background Radar Effect ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-20">
            {[1, 2, 3].map((circle) => (
                <motion.div
                    key={circle}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 2, opacity: [0, 0.5, 0] }}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        delay: circle * 1.3,
                        ease: "linear"
                    }}
                    className="absolute inset-0 border border-spotify-green rounded-full shadow-[0_0_20px_#1ed760]"
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-spotify-green mb-3"
                >
                    <HiLightningBolt className="h-5 w-5 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.4em]">Sintonizando...</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-4 leading-none">
                    Radar <span className="text-spotify-green underline decoration-white/10 underline-offset-8">Musical</span>
                </h1>
                <p className="text-spotify-text text-lg max-w-xl font-medium leading-relaxed">
                    Analisamos suas playlists para descobrir músicas inéditas que combinam com você.
                </p>
            </div>
            <button 
                onClick={fetchRadar}
                disabled={loading}
                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
                <HiRefresh className={cn("h-5 w-5", loading && "animate-spin")} />
                Recarregar Radar
            </button>
        </div>

        {loading ? (
           <div className="h-[50vh] flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 mb-8">
                 <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-spotify-green/20 border-t-spotify-green rounded-full"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <HiMusicNote className="h-10 w-10 text-spotify-green animate-bounce" />
                 </div>
              </div>
              <p className="text-white/40 font-black uppercase tracking-[0.3em] animate-pulse">Escanenando biblioteca...</p>
           </div>
        ) : error ? (
            <div className="p-20 text-center bg-white/5 rounded-[40px] border border-white/5 backdrop-blur-3xl">
                <p className="text-white/60 font-bold">{error}</p>
                <button onClick={fetchRadar} className="mt-4 text-spotify-green underline font-black">Tentar Novamente</button>
            </div>
        ) : (
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:grid-cols-5 gap-6"
            >
                {recommendations.map((rec, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={rec.videoId}
                        className="group relative flex flex-col rounded-3xl bg-white/[0.03] border border-white/5 p-4 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:translate-y-[-8px] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] cursor-pointer overflow-hidden pb-14"
                    >
                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-xl">
                            <Image 
                                src={rec.thumbnail} 
                                alt={rec.title} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handlePlay(rec); }}
                                    className="p-4 bg-spotify-green text-black rounded-full scale-50 group-hover:scale-100 transition-transform shadow-[0_0_30px_#1ed760]"
                                >
                                    <HiPlay className="h-8 w-8" />
                                </button>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] font-bold text-white backdrop-blur-lg">
                                {Math.floor(rec.duration / 60)}:{String(rec.duration % 60).padStart(2, '0')}
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-[10px] font-black text-spotify-green uppercase tracking-widest mb-1.5 flex items-center gap-1.5 bg-spotify-green/10 w-fit px-2 py-0.5 rounded-full">
                                <HiEmojiHappy className="h-3 w-3" /> {rec.reason}
                            </p>
                            <h3 className="text-sm font-black text-white line-clamp-2 leading-tight group-hover:text-spotify-green transition-colors">
                                {rec.title}
                            </h3>
                            <p className="text-[11px] text-spotify-text mt-1 font-bold">{rec.channel}</p>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 z-20">
                            <div className="relative">
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setActiveSaveId(activeSaveId === rec.videoId ? null : rec.videoId); 
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all group/btn"
                                >
                                    <HiPlus className="h-4 w-4 text-spotify-green" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Salvar</span>
                                    <HiChevronDown className={cn("h-3 w-3 transition-transform", activeSaveId === rec.videoId && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {activeSaveId === rec.videoId && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: -4, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 right-0 mb-2 bg-spotify-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto z-50 p-2 scrollbar-hide"
                                        >
                                            {myPlaylists.length === 0 ? (
                                                <p className="text-[10px] text-white/40 p-3 italic">Crie uma playlist primeiro</p>
                                            ) : (
                                                myPlaylists.map(pl => (
                                                    <button
                                                        key={pl.id}
                                                        onClick={(e) => { e.stopPropagation(); handleSaveToPlaylist(rec, pl.id); }}
                                                        disabled={!!isSaving}
                                                        className="flex items-center justify-between w-full px-4 py-2 text-[11px] font-bold text-white hover:bg-spotify-green hover:text-black rounded-xl transition-colors mb-1 last:mb-0"
                                                    >
                                                        <span className="truncate mr-2">{pl.name}</span>
                                                        {isSaving === `${rec.videoId}-${pl.id}` ? (
                                                            <div className="h-3 w-3 animate-spin border-2 border-current border-t-transparent rounded-full" />
                                                        ) : (
                                                            <HiPlus className="h-3 w-3 opacity-40" />
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-spotify-green/5 blur-3xl group-hover:bg-spotify-green/20 transition-all rounded-full" />
                    </motion.div>
                ))}
            </motion.div>
        )}
      </div>

    </div>
  )
}
