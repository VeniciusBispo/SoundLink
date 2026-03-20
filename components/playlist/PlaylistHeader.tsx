'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HiChevronLeft, HiDotsVertical } from 'react-icons/hi'
import { cn } from '@/lib/utils'

interface PlaylistHeaderProps {
  title: string
  onMenuClick?: () => void
}

export default function PlaylistHeader({ title, onMenuClick }: PlaylistHeaderProps) {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center justify-between px-4 transition-all duration-300',
        isScrolled ? 'bg-[#121212]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      )}
    >
      <button 
        onClick={() => router.back()} 
        className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
        aria-label="Voltar"
      >
        <HiChevronLeft className="h-7 w-7" />
      </button>

      <h1
        className={cn(
          'text-base font-bold text-white max-w-[60%] truncate transition-opacity duration-300',
          isScrolled ? 'opacity-100' : 'opacity-0'
        )}
      >
        {title}
      </h1>

      <button 
        onClick={onMenuClick} 
        className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
        aria-label="Menu"
      >
        <HiDotsVertical className="h-5 w-5" />
      </button>
    </header>
  )
}
