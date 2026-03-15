'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
  HiPlay,
  HiTrash,
  HiPlus,
  HiDownload,
  HiCheck,
  HiLockClosed,
  HiGlobe,
  HiExternalLink,
} from 'react-icons/hi'
import MainLayout from '@/components/layout/MainLayout'
import SongList from '@/components/playlist/SongList'
import AddSongModal from '@/components/playlist/AddSongModal'
import ImportPlaylistModal from '@/components/playlist/ImportPlaylistModal'
import ShareModal from '@/components/playlist/ShareModal'
import Button from '@/components/ui/Button'
import {
  getPlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
} from '@/services/playlistService'
import { getOfflinePlaylist } from '@/services/offlineService'
import { usePlaylistStore } from '@/store/playlistStore'
import { useOfflinePlaylist } from '@/hooks/useOffline'
import { usePlayer } from '@/hooks/usePlayer'
import { formatTotalDuration } from '@/lib/utils'
import type { Playlist } from '@/types'

// ─────────────────────────────────────────────────────
// Inner component (needs useSearchParams → Suspense wrapper)
// ─────────────────────────────────────────────────────
function PlaylistPageInner() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isForbidden, setIsForbidden] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [isAddSongOpen, setIsAddSongOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const currentPlaylist = usePlaylistStore((s) => s.currentPlaylist)
  const setCurrentPlaylist = usePlaylistStore((s) => s.setCurrentPlaylist)
  const removeSongFromStore = usePlaylistStore((s) => s.removeSongFromCurrentPlaylist)

  const { isOffline: isOfflineSaved, isSaving, save: saveOffline, remove: removeOffline } =
    useOfflinePlaylist(id)
  const { playPlaylist } = usePlayer()

  const urlCode = searchParams.get('code') ?? ''

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      setError('')
      setIsForbidden(false)
      try {
        const data = await getPlaylist(id, urlCode || undefined)
        if (!cancelled) setCurrentPlaylist(data)
      } catch (err: unknown) {
        if (cancelled) return
        const msg = (err as Error).message
        // Always try offline cache first before showing an error
        const offline = await getOfflinePlaylist(id)
        if (offline) {
          setCurrentPlaylist(offline)
        } else if (msg === 'Forbidden') {
          setIsForbidden(true)
        } else {
          setError(msg)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
      setCurrentPlaylist(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, urlCode])

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeInput.trim()) return
    const code = codeInput.trim().toUpperCase()
    setIsLoading(true)
    setCodeError('')
    try {
      const data = await getPlaylist(id, code)
      setCurrentPlaylist(data)
      setIsForbidden(false)
    } catch (err: unknown) {
      const msg = (err as Error).message
      setCodeError(msg === 'Forbidden' ? 'Código incorreto. Tente novamente.' : msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Excluir esta playlist? Esta ação não pode ser desfeita.')) return
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
      await saveOffline(currentPlaylist as Playlist, songs)
    }
  }

  // ── Loading ──────────────────────────────────────────
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </MainLayout>
    )
  }

  // ── Private playlist — needs code ────────────────────
  if (isForbidden && !currentPlaylist) {
    return (
      <MainLayout>
        <div className="flex h-full flex-col items-center justify-center gap-5 px-4 py-20 text-center">
          <HiLockClosed className="h-12 w-12 text-spotify-text" />
          <div>
            <h2 className="text-xl font-bold text-white">Playlist privada</h2>
            <p className="mt-1 text-sm text-spotify-text">
              Insira o código de acesso fornecido pelo dono da playlist
            </p>
          </div>
          <form onSubmit={handleCodeSubmit} className="flex w-full max-w-xs flex-col gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Ex: A3F2B891"
              maxLength={8}
              className="rounded-xl bg-spotify-card px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-white placeholder:text-spotify-text/40 focus:outline-none focus:ring-2 focus:ring-spotify-green"
            />
            {codeError && <p className="text-xs text-red-400">{codeError}</p>}
            <Button variant="primary" type="submit" size="md" className="w-full">
              Acessar
            </Button>
          </form>
        </div>
      </MainLayout>
    )
  }

  // ── Error / not found ────────────────────────────────
  if (error || !currentPlaylist) {
    return (
      <MainLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-spotify-text">{error || 'Playlist não encontrada'}</p>
          <Button variant="ghost" onClick={() => router.push('/')}>
            Voltar ao início
          </Button>
        </div>
      </MainLayout>
    )
  }

  const songs = currentPlaylist.songs?.map((ps) => ps.song) ?? []
  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0)
  const isOwner = session?.user?.id === currentPlaylist.ownerId
  const existingVideoIds = new Set(songs.map((s) => s.youtubeVideoId))

  return (
    <MainLayout>
      {/* Hero */}
      <div className="flex flex-col gap-4 bg-gradient-to-b from-purple-900/50 to-transparent px-4 py-6 md:flex-row md:items-end md:gap-6 md:px-6 md:py-8">
        <div className="mx-auto h-36 w-36 flex-shrink-0 overflow-hidden rounded-lg shadow-2xl md:mx-0 md:h-48 md:w-48">
          {currentPlaylist.coverImage ? (
            <Image
              src={currentPlaylist.coverImage}
              alt={currentPlaylist.name}
              width={192}
              height={192}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-800 to-purple-600">
              <span className="text-5xl">🎵</span>
            </div>
          )}
        </div>

        <div className="min-w-0 text-center md:text-left">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
            Playlist
          </p>
          <h1 className="mb-2 break-words text-2xl font-black text-white md:text-4xl">
            {currentPlaylist.name}
          </h1>
          {currentPlaylist.description && (
            <p className="mb-2 text-sm text-spotify-text">{currentPlaylist.description}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-spotify-text md:justify-start">
            {currentPlaylist.owner && (
              <span className="font-semibold text-white">{currentPlaylist.owner.username}</span>
            )}
            <span>•</span>
            <span>{songs.length} músicas</span>
            {totalDuration > 0 && (
              <>
                <span>•</span>
                <span>{formatTotalDuration(totalDuration)}</span>
              </>
            )}
            <span>•</span>
            {currentPlaylist.isPublic ? (
              <span className="flex items-center gap-1">
                <HiGlobe className="h-3 w-3" /> Pública
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <HiLockClosed className="h-3 w-3" /> Privada
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 md:gap-3 md:px-6 md:py-4">
        {songs.length > 0 && (
          <button
            onClick={() => playPlaylist(songs)}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-spotify-green text-black shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <HiPlay className="ml-1 h-6 w-6" />
          </button>
        )}

        {isOwner && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddSongOpen(true)}
              className="flex items-center gap-1.5"
            >
              <HiPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5"
            >
              <HiPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Importar YT</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5"
            >
              <HiExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300"
            >
              <HiTrash className="h-4 w-4" />
              <span className="hidden sm:inline">Excluir</span>
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveOffline}
          isLoading={isSaving}
          className={`flex items-center gap-1.5 ${isOfflineSaved ? 'text-spotify-green' : ''}`}
        >
          {isOfflineSaved ? (
            <>
              <HiCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Salvo offline</span>
            </>
          ) : (
            <>
              <HiDownload className="h-4 w-4" />
              <span className="hidden sm:inline">Salvar offline</span>
            </>
          )}
        </Button>
      </div>

      {/* Song list */}
      <div className="px-4 pb-24 md:pb-8 md:px-6">
        <SongList
          songs={currentPlaylist.songs ?? []}
          canEdit={isOwner}
          onRemove={isOwner ? handleRemoveSong : undefined}
        />
      </div>

      {/* Modals */}
      {isOwner && (
        <AddSongModal
          isOpen={isAddSongOpen}
          onClose={() => setIsAddSongOpen(false)}
          playlistId={id}
        />
      )}
      {isOwner && (
        <ImportPlaylistModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          playlistId={id}
          existingVideoIds={existingVideoIds}
        />
      )}
      {isOwner && (
        <ShareModal
          playlistId={id}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          initialShareEnabled={currentPlaylist.shareEnabled ?? false}
          initialShareCode={currentPlaylist.shareCode ?? null}
        />
      )}
    </MainLayout>
  )
}

export default function PlaylistPage() {
  return (
    <Suspense>
      <PlaylistPageInner />
    </Suspense>
  )
}
