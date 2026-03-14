'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { HiPlay, HiPencil, HiTrash, HiPlus, HiDownload, HiCheck, HiLockClosed, HiGlobe } from 'react-icons/hi'
import MainLayout from '@/components/layout/MainLayout'
import SongList from '@/components/playlist/SongList'
import AddSongModal from '@/components/playlist/AddSongModal'
import Button from '@/components/ui/Button'
import { getPlaylist, deletePlaylist, removeSongFromPlaylist } from '@/services/playlistService'
import { usePlaylistStore } from '@/store/playlistStore'
import { useOfflinePlaylist } from '@/hooks/useOffline'
import { usePlayer } from '@/hooks/usePlayer'
import { formatTotalDuration } from '@/lib/utils'
import type { Playlist } from '@/types'

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddSongOpen, setIsAddSongOpen] = useState(false)

  const currentPlaylist = usePlaylistStore((s) => s.currentPlaylist)
  const setCurrentPlaylist = usePlaylistStore((s) => s.setCurrentPlaylist)
  const removeSongFromStore = usePlaylistStore((s) => s.removeSongFromCurrentPlaylist)

  const { isOffline: isOfflineSaved, isSaving, save: saveOffline, remove: removeOffline } =
    useOfflinePlaylist(id)
  const { playPlaylist } = usePlayer()

  useEffect(() => {
    setIsLoading(true)
    getPlaylist(id)
      .then(setCurrentPlaylist)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false))

    return () => setCurrentPlaylist(null)
  }, [id, setCurrentPlaylist])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </MainLayout>
    )
  }

  if (error || !currentPlaylist) {
    return (
      <MainLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-spotify-text">{error || 'Playlist not found'}</p>
          <Button variant="ghost" onClick={() => router.push('/')}>Go home</Button>
        </div>
      </MainLayout>
    )
  }

  const songs = currentPlaylist.songs?.map((ps) => ps.song) ?? []
  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0)
  const isOwner = session?.user?.id === currentPlaylist.ownerId

  const handleDelete = async () => {
    if (!confirm('Delete this playlist? This cannot be undone.')) return
    try {
      await deletePlaylist(id)
      router.push('/')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleRemoveSong = async (songId: string) => {
    try {
      await removeSongFromPlaylist(id, songId)
      removeSongFromStore(songId)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleSaveOffline = async () => {
    if (isOfflineSaved) {
      await removeOffline()
    } else {
      await saveOffline(currentPlaylist, songs)
    }
  }

  return (
    <MainLayout>
      {/* Hero */}
      <div className="flex items-end gap-6 bg-gradient-to-b from-purple-900/50 to-transparent px-6 py-8">
        <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded shadow-2xl">
          {currentPlaylist.coverImage ? (
            <Image
              src={currentPlaylist.coverImage}
              alt={currentPlaylist.name}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-800 to-purple-600">
              <span className="text-6xl">🎵</span>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
            Playlist
          </p>
          <h1 className="mb-2 text-4xl font-black text-white">{currentPlaylist.name}</h1>
          {currentPlaylist.description && (
            <p className="mb-2 text-sm text-spotify-text">{currentPlaylist.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-spotify-text">
            {currentPlaylist.owner && (
              <span className="font-semibold text-white">{currentPlaylist.owner.username}</span>
            )}
            <span>•</span>
            <span>{songs.length} songs</span>
            {totalDuration > 0 && (
              <>
                <span>•</span>
                <span>{formatTotalDuration(totalDuration)}</span>
              </>
            )}
            <span>•</span>
            {currentPlaylist.isPublic ? (
              <span className="flex items-center gap-1"><HiGlobe className="h-3 w-3" /> Public</span>
            ) : (
              <span className="flex items-center gap-1"><HiLockClosed className="h-3 w-3" /> Private</span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4 px-6 py-4">
        {songs.length > 0 && (
          <button
            onClick={() => playPlaylist(songs)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-spotify-green text-black shadow-lg hover:scale-105 transition-transform"
          >
            <HiPlay className="ml-1 h-7 w-7" />
          </button>
        )}

        {isOwner && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddSongOpen(true)}
              className="flex items-center gap-2"
            >
              <HiPlus className="h-4 w-4" /> Add song
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-400 hover:text-red-300"
            >
              <HiTrash className="h-4 w-4" /> Delete playlist
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveOffline}
          isLoading={isSaving}
          className={`flex items-center gap-2 ${isOfflineSaved ? 'text-spotify-green' : ''}`}
        >
          {isOfflineSaved ? (
            <><HiCheck className="h-4 w-4" /> Saved offline</>
          ) : (
            <><HiDownload className="h-4 w-4" /> Save offline</>
          )}
        </Button>
      </div>

      {/* Song list */}
      <div className="px-6 pb-8">
        <SongList
          songs={currentPlaylist.songs ?? []}
          canEdit={isOwner}
          onRemove={isOwner ? handleRemoveSong : undefined}
        />
      </div>

      {/* Add song modal */}
      {isOwner && (
        <AddSongModal
          isOpen={isAddSongOpen}
          onClose={() => setIsAddSongOpen(false)}
          playlistId={id}
        />
      )}
    </MainLayout>
  )
}
