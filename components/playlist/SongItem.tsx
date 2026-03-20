'use client'

import Image from 'next/image'
import { HiPlay, HiTrash, HiDotsVertical } from 'react-icons/hi'
import { motion } from 'framer-motion'
import { cn, formatDuration } from '@/lib/utils'

// Assuming Song type has these fields based on SongList usage
interface Song {
  id: string
  title: string
  channel: string
  thumbnail: string
  duration: number
  youtubeVideoId: string
}

interface SongItemProps {
  song: Song
  index: number
  isActive: boolean
  isPlaying: boolean
  duration: number
  addedByUsername?: string
  canEdit?: boolean
  onPlay: () => void
  onRemove?: () => void
  onMenu?: () => void
}

export default function SongItem({
  song, 
  isActive, 
  isPlaying, 
  duration, 
  addedByUsername, 
  canEdit, 
  onPlay, 
  onRemove, 
  onMenu
}: SongItemProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.05)' }}
      className={cn(
        'group flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors',
        isActive ? 'bg-white/10' : 'hover:bg-[#1f1f1f]'
      )}
      onClick={onPlay}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Cover */}
        <div className="relative h-[48px] w-[48px] flex-shrink-0 overflow-hidden rounded shadow-sm">
          <Image 
            src={song.thumbnail} 
            alt={song.title} 
            fill 
            className="object-cover" 
            sizes="48px" 
          />
        </div>

        {/* Text */}
        <div className="flex flex-col truncate pr-2">
          <span 
            className={cn(
              'truncate text-[15px] font-semibold tracking-tight', 
              isActive ? 'text-spotify-green' : 'text-white'
            )}
          >
            {song.title}
          </span>
          <span className="truncate text-[13px] text-spotify-text">
            {isActive && isPlaying && <HiPlay className="inline mr-1 text-spotify-green h-3 w-3" />}
            {song.channel} {addedByUsername && ` • ${addedByUsername}`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-[12px] font-medium text-spotify-text hidden sm:inline-block mr-2">
          {formatDuration(duration)}
        </span>
        
        {canEdit && onRemove ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-2 text-spotify-text hover:text-red-400 transition-colors"
            aria-label="Remover"
          >
            <HiTrash className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMenu?.()
            }}
            className="p-2 text-spotify-text hover:text-white transition-colors"
            aria-label="Opções"
          >
            <HiDotsVertical className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
