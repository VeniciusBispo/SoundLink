'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HiPlay, HiMusicNote } from 'react-icons/hi'
import { useContinueWatchingStore } from '@/store/continueWatchingStore'
import { usePlayer } from '@/hooks/usePlayer'

function isLikelyImageSrc(v: string) {
  return /^data:image\//.test(v) || /^https?:\/\//.test(v) || v.startsWith('/')
}

export default function ContinueWatchingSection() {
  const [isMounted, setIsMounted] = useState(false)
  const { lastPlayedSong, lastPlaylist, progress } = useContinueWatchingStore()
  const { playSong } = usePlayer()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || (!lastPlayedSong && !lastPlaylist)) return null

  const title = lastPlaylist ? lastPlaylist.name : lastPlayedSong?.title
  const subtitle = lastPlaylist ? 'Playlist' : lastPlayedSong?.channel
  const cover = lastPlaylist?.coverImage || lastPlayedSong?.thumbnail
  
  const duration = lastPlayedSong?.duration || 1
  const percent = Math.min((progress / duration) * 100, 100)

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    if (lastPlayedSong) {
      playSong(lastPlayedSong)
    }
  }

  const href = lastPlaylist ? `/playlist/${lastPlaylist.id}` : '#'

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Continuar Assistindo</h2>
      </div>
      
      <div className="group relative flex items-center justify-between overflow-hidden rounded-xl bg-gradient-to-r from-brand-card to-white/5 p-4 transition-all hover:bg-white/10 sm:w-full md:w-1/2 lg:w-1/3 border border-white/5">
        <Link href={href} className="absolute inset-0 z-0" aria-label="Acessar" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md shadow-lg">
            {cover && isLikelyImageSrc(cover) ? (
              <Image src={cover} alt={title || 'Cover'} fill className="object-cover" sizes="56px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-primary/40 to-brand-card">
                <HiMusicNote className="h-6 w-6 text-brand-primary" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <h3 className="line-clamp-1 text-base font-bold text-white">{title}</h3>
            <p className="line-clamp-1 text-sm text-brand-text">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={handlePlay}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-black opacity-0 shadow-xl transition-all hover:scale-105 hover:bg-green-400 group-hover:opacity-100"
          aria-label="Continuar ouvindo"
        >
          <HiPlay className="h-6 w-6 ml-1" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10">
          <div 
            className="h-full bg-brand-primary rounded-r-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </section>
  )
}
