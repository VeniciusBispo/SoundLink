'use client'

import { useState } from 'react'
import Image from 'next/image'
import { HiMusicNote } from 'react-icons/hi'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useYouTube } from '@/hooks/useYouTube'
import { addSongToPlaylist } from '@/services/playlistService'
import { usePlaylistStore } from '@/store/playlistStore'
import { formatDuration } from '@/lib/utils'

interface AddSongModalProps {
  isOpen: boolean
  onClose: () => void
  playlistId: string
  accessCode?: string
}

export default function AddSongModal({ isOpen, onClose, playlistId, accessCode }: AddSongModalProps) {
  const [url, setUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const { videoInfo, isLoading, error, lookup, reset } = useYouTube()
  const addSongToCurrentPlaylist = usePlaylistStore((s) => s.addSongToCurrentPlaylist)

  const handleLookup = async () => {
    if (!url.trim()) return
    await lookup(url.trim())
  }

  const handleAdd = async () => {
    if (!videoInfo) return
    setIsSaving(true)
    setSaveError('')
    try {
      const song = await addSongToPlaylist(
        playlistId,
        {
          youtubeVideoId: videoInfo.videoId,
          title: videoInfo.title,
          duration: videoInfo.duration,
          thumbnail: videoInfo.thumbnail,
          channel: videoInfo.channel,
        },
        accessCode
      )
      addSongToCurrentPlaylist(song as Parameters<typeof addSongToCurrentPlaylist>[0])
      setUrl('')
      reset()
      onClose()
    } catch (err) {
      setSaveError((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setUrl('')
    setSaveError('')
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Música">
      <div className="flex flex-col gap-4">
        {/* URL input */}
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Cole o link do YouTube…"
            className="flex-1 rounded-md bg-spotify-hover px-3 py-2 text-sm text-white placeholder-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
          <Button onClick={handleLookup} isLoading={isLoading} size="sm">
            Buscar
          </Button>
        </div>

        {/* Error */}
        {(error || saveError) && (
          <p className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-400">
            {error || saveError}
          </p>
        )}

        {/* Preview */}
        {videoInfo && (
          <div className="flex items-center gap-4 rounded-md bg-spotify-hover p-3">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
              <Image
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-white">{videoInfo.title}</p>
              <p className="text-xs text-spotify-text">{videoInfo.channel}</p>
              <p className="text-xs text-spotify-text">{formatDuration(videoInfo.duration)}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={!videoInfo} isLoading={isSaving}>
            Adicionar à playlist
          </Button>
        </div>
      </div>
    </Modal>
  )
}
