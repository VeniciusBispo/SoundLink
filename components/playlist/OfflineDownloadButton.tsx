'use client'

import { useState } from 'react'
import { HiDownload, HiCheck, HiOutlineRefresh } from 'react-icons/hi'
import { cn } from '@/lib/utils'

interface OfflineDownloadButtonProps {
  isOfflineSaved: boolean
  isSaving: boolean
  onToggleSave: () => Promise<void>
}

export default function OfflineDownloadButton({
  isOfflineSaved,
  isSaving,
  onToggleSave,
}: OfflineDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await onToggleSave()
    } finally {
      setLoading(false)
    }
  }

  const isLoading = isSaving || loading

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
        isLoading 
          ? 'bg-white/10 text-white/50 cursor-not-allowed'
          : isOfflineSaved
            ? 'bg-spotify-green/20 text-spotify-green hover:bg-spotify-green/30'
            : 'bg-white/10 text-white hover:bg-white/20'
      )}
    >
      {isLoading ? (
        <>
          <HiOutlineRefresh className="h-5 w-5 animate-spin" />
          <span>Baixando...</span>
        </>
      ) : isOfflineSaved ? (
        <>
          <HiCheck className="h-5 w-5" />
          <span>Baixado</span>
        </>
      ) : (
        <>
          <HiDownload className="h-5 w-5" />
          <span>Download</span>
        </>
      )}
    </button>
  )
}
