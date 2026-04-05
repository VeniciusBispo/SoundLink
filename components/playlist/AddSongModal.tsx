'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { HiMusicNote, HiSearch } from 'react-icons/hi'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useYouTube } from '@/hooks/useYouTube'
import { addSongToPlaylist } from '@/services/playlistService'
import { usePlaylistStore } from '@/store/playlistStore'
import { formatDuration } from '@/lib/utils'
import YouTubeLinkHelper from '@/components/ui/YouTubeLinkHelper'
import { useDebounce } from '@/hooks/useDebounce'

interface AddSongModalProps {
  isOpen: boolean
  onClose: () => void
  playlistId: string
  accessCode?: string
}

interface SearchResultItem {
  videoId: string
  title: string
  channel: string
  thumbnail: string
  duration: number
}

export default function AddSongModal({ isOpen, onClose, playlistId, accessCode }: AddSongModalProps) {
  const [inputVal, setInputVal] = useState('')
  const debouncedInput = useDebounce(inputVal, 700)
  const isLinkMode = inputVal.includes('youtube.com') || inputVal.includes('youtu.be')

  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  
  // Track which song is currently being saved from the search list
  const [savingVideoId, setSavingVideoId] = useState<string | null>(null)

  const { videoInfo, isLoading: isLookupLoading, error: lookupError, lookup, reset: resetLookup } = useYouTube()
  const addSongToCurrentPlaylist = usePlaylistStore((s) => s.addSongToCurrentPlaylist)

  useEffect(() => {
    async function performAction() {
      if (!debouncedInput.trim()) {
        setSearchResults([])
        setSearchError('')
        resetLookup()
        return
      }

      if (debouncedInput.includes('youtube.com') || debouncedInput.includes('youtu.be')) {
        // Link Mode
        setSearchResults([])
        setSearchError('')
        await lookup(debouncedInput.trim())
      } else {
        // Search Mode
        resetLookup()
        setIsSearching(true)
        setSearchError('')
        try {
          const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(debouncedInput.trim())}`)
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Erro ao buscar no YouTube')
          setSearchResults(data.results || [])
        } catch (err) {
          setSearchError((err as Error).message)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }
    }
    
    // Only perform action if modal is open to prevent background fetches
    if (isOpen) {
        performAction()
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput, isOpen])

  const saveSong = async (
    videoData: { videoId: string; title: string; duration: number; thumbnail: string; channel: string }
  ) => {
    setIsSaving(true)
    setSaveError('')
    setSavingVideoId(videoData.videoId)
    try {
      const song = await addSongToPlaylist(
        playlistId,
        {
          youtubeVideoId: videoData.videoId,
          title: videoData.title,
          duration: videoData.duration,
          thumbnail: videoData.thumbnail,
          channel: videoData.channel,
        },
        accessCode
      )
      addSongToCurrentPlaylist(song as Parameters<typeof addSongToCurrentPlaylist>[0])
      handleClose()
    } catch (err) {
      setSaveError((err as Error).message)
    } finally {
      setIsSaving(false)
      setSavingVideoId(null)
    }
  }

  const handleAddFromLink = async () => {
    if (!videoInfo) return
    await saveSong({
      videoId: videoInfo.videoId,
      title: videoInfo.title,
      duration: videoInfo.duration,
      thumbnail: videoInfo.thumbnail,
      channel: videoInfo.channel,
    })
  }

  const handleClose = () => {
    setInputVal('')
    setSaveError('')
    setSearchError('')
    setSearchResults([])
    resetLookup()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Música" maxWidth="3xl">
      <div className="flex flex-col gap-5">
        {/* Unified Input */}
        <div className="flex items-center gap-3 rounded-xl bg-brand-hover p-2 shadow-inner">
          <div className="pl-2">
            <HiSearch className="h-5 w-5 text-brand-text" />
          </div>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Buscar música ou colar link do YouTube..."
            className="flex-1 bg-transparent px-2 py-2 text-base text-white placeholder-brand-text focus:outline-none"
            autoFocus
          />
          {(isSearching || isLookupLoading) && (
            <div className="pr-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
          )}
        </div>

        {/* Errors */}
        {(lookupError || saveError || searchError) && (
          <p className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-400 border border-red-500/20">
            {lookupError || saveError || searchError}
          </p>
        )}

        {/* Link Result Preview */}
        {isLinkMode && videoInfo && (
          <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-brand-hover to-transparent p-4 border border-white/5">
            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md shadow-lg">
              <Image
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold text-white">{videoInfo.title}</p>
              <p className="text-xs text-brand-text mt-1">{videoInfo.channel}</p>
              <p className="text-xs font-semibold text-brand-primary mt-1">
                {formatDuration(videoInfo.duration)}
              </p>
            </div>
            <Button onClick={handleAddFromLink} disabled={!videoInfo} isLoading={isSaving} size="md">
              Adicionar
            </Button>
          </div>
        )}

        {/* Search Results List */}
        {!isLinkMode && searchResults.length > 0 && (
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 rounded-xl">
            {searchResults.map((item) => (
              <div
                key={item.videoId}
                className="group flex items-center gap-4 rounded-lg p-2 transition-all hover:bg-white/5"
              >
                <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded bg-black/50">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <HiMusicNote className="h-5 w-5 text-brand-text" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white group-hover:text-brand-primary transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="truncate text-xs text-brand-text">{item.channel}</p>
                    <span className="text-[10px] text-brand-text/50">•</span>
                    <p className="text-xs text-brand-text">{item.duration > 0 ? formatDuration(item.duration) : '--:--'}</p>
                  </div>
                </div>
                <Button
                  onClick={() => saveSong(item)}
                  isLoading={savingVideoId === item.videoId}
                  disabled={isSaving && savingVideoId !== item.videoId}
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white/5 hover:bg-brand-primary hover:text-black hover:border-transparent text-white"
                >
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for Search */}
        {!isLinkMode && inputVal.trim() && !isSearching && searchResults.length === 0 && !searchError && (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-brand-text">Nenhum resultado encontrado para "{inputVal}"</p>
          </div>
        )}

        {/* Link Helper Widget - Always available to assist users */}
        <YouTubeLinkHelper mode="song" />
        
        {/* Cancel Action */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <Button variant="ghost" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
