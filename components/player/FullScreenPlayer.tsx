'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiChevronDown, 
  HiPlay, 
  HiPause, 
  HiDotsHorizontal, 
  HiFastForward, 
  HiRewind, 
  HiVolumeUp,
  HiVolumeOff
} from 'react-icons/hi'
import { usePlayer } from '@/hooks/usePlayer'
import { formatDuration } from '@/lib/utils'

interface FullScreenPlayerProps {
  isOpen: boolean
  onClose: () => void
}

export default function FullScreenPlayer({ isOpen, onClose }: FullScreenPlayerProps) {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    currentTime, 
    duration, 
    seek,
    volume,
    setVolume
  } = usePlayer()

  const [isHoveringVol, setIsHoveringVol] = useState(false)

  if (!currentSong) return null

  const displayDuration = duration > 0 ? duration : currentSong.duration
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 flex flex-col bg-spotify-black overflow-hidden"
        >
          {/* Dynamic blurry background based on thumbnail */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <Image 
              src={currentSong.thumbnail} 
              alt="Blurred Background"
              fill
              className="object-cover blur-[80px]"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 flex flex-col h-full safe-area-top safe-area-bottom px-6 py-4">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <button 
                onClick={onClose}
                className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <HiChevronDown className="h-7 w-7" />
              </button>
              <div className="text-center">
                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">Tocando da Playlist</p>
              </div>
              <button className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <HiDotsHorizontal className="h-6 w-6" />
              </button>
            </header>

            {/* ARTWORK */}
            <div className="flex-1 flex items-center justify-center mb-8 min-h-0">
              <div className="relative w-full max-w-[320px] aspect-square shadow-2xl rounded-2xl overflow-hidden bg-[#222]">
                <Image
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 400px) 100vw, 320px"
                  priority
                />
              </div>
            </div>

            {/* INFO & CONTROLS */}
            <div className="flex flex-col gap-6 mt-auto pb-6">
              {/* Title & Artist */}
              <div>
                <motion.h2 
                  key={currentSong.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold text-white truncate mb-1"
                >
                  {currentSong.title}
                </motion.h2>
                <motion.p 
                  key={currentSong.channel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-base text-white/70 truncate"
                >
                  {currentSong.channel}
                </motion.p>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="relative h-2 bg-white/20 rounded-full cursor-pointer group">
                  <div 
                    className="absolute top-0 left-0 h-full bg-white group-hover:bg-spotify-green rounded-full transition-colors"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${progressPercent}% - 6px)` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={displayDuration || 100}
                    value={currentTime}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs text-white/50 font-medium tabular-nums">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(displayDuration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-between px-2">
                <button 
                  onClick={() => setVolume(volume === 0 ? 80 : 0)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {volume === 0 ? <HiVolumeOff className="h-6 w-6" /> : <HiVolumeUp className="h-6 w-6" />}
                </button>

                <div className="flex items-center gap-6 md:gap-8">
                  <button 
                    onClick={() => seek(Math.max(0, currentTime - 10))}
                    className="text-white hover:scale-105 active:scale-95 transition-transform"
                  >
                    <HiRewind className="h-9 w-9" />
                  </button>
                  
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="flex items-center justify-center h-16 w-16 bg-white text-black rounded-full hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <HiPause className="h-8 w-8" /> : <HiPlay className="h-8 w-8 ml-1" />}
                  </motion.button>
                  
                  <button 
                    onClick={() => seek(Math.min(displayDuration, currentTime + 10))}
                    className="text-white hover:scale-105 active:scale-95 transition-transform"
                  >
                    <HiFastForward className="h-9 w-9" />
                  </button>
                </div>

                <div className="w-6" /> {/* Placeholder for balance */}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
