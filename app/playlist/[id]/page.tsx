'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  HiPlay,
  HiTrash,
  HiPlus,
  HiLockClosed,
  HiGlobe,
  HiExternalLink,
  HiPencil,
} from 'react-icons/hi'
import MainLayout from '@/components/layout/MainLayout'
import SongList from '@/components/playlist/SongList'
import AddSongModal from '@/components/playlist/AddSongModal'
import ImportPlaylistModal from '@/components/playlist/ImportPlaylistModal'
import ShareModal from '@/components/playlist/ShareModal'
import DeleteConfirmModal from '@/components/playlist/DeleteConfirmModal'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import {
  getPlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
  updatePlaylist as updatePlaylistApi,
} from '@/services/playlistService'
import { usePlaylistStore } from '@/store/playlistStore'
import { usePlayer } from '@/hooks/usePlayer'
import { useRecentPlaylists } from '@/hooks/useRecentPlaylists'
import { formatTotalDuration } from '@/lib/utils'
import type { Playlist } from '@/types'

const PlaylistCoverPicker = dynamic(() => import('@/components/playlist/PlaylistCoverPicker'), { ssr: false })

function isLikelyImageSrc(v: string) {
  return /^data:image\//.test(v) || /^https?:\/\//.test(v) || v.startsWith('/')
}

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCoverOpen, setIsCoverOpen] = useState(false)
  const [coverDraft, setCoverDraft] = useState('')
  const [nameDraft, setNameDraft] = useState('')
  const [isPublicDraft, setIsPublicDraft] = useState(false)
  const [isSavingCover, setIsSavingCover] = useState(false)
  const [coverError, setCoverError] = useState('')

  const currentPlaylist = usePlaylistStore((s) => s.currentPlaylist)
  const setCurrentPlaylist = usePlaylistStore((s) => s.setCurrentPlaylist)
  const updatePlaylist = usePlaylistStore((s) => s.updatePlaylist)
  const removeSongFromStore = usePlaylistStore((s) => s.removeSongFromCurrentPlaylist)

  const { playPlaylist } = usePlayer()
  const { push: pushRecent, updateMetadata: updateRecentMetadata } = useRecentPlaylists()

  const urlCode = searchParams.get('code') ?? ''

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      setError('')
      setIsForbidden(false)
      try {
        const data = await getPlaylist(id, urlCode || undefined)
        if (!cancelled) {
          setCurrentPlaylist(data)
          pushRecent({
            id: data.id,
            name: data.name,
            coverImage: data.coverImage ?? null,
            ownerUsername: data.owner?.username ?? '',
            songCount: data._count?.songs ?? data.songs?.length ?? 0,
          })
        }
      } catch (err: unknown) {
        if (cancelled) return
        const msg = (err as Error).message
        if (msg === 'Forbidden') {
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
  }, [id, urlCode, setCurrentPlaylist, pushRecent])

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

  const handleDelete = () => setIsDeleteOpen(true)

  const openCoverModal = () => {
    setCoverError('')
    setCoverDraft(currentPlaylist?.coverImage ?? '')
    setNameDraft(currentPlaylist?.name ?? '')
    setIsPublicDraft(currentPlaylist?.isPublic ?? false)
    setIsCoverOpen(true)
  }

  const handleSaveCover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameDraft.trim()) {
      setCoverError('O nome da playlist é obrigatório')
      return
    }
    setCoverError('')
    setIsSavingCover(true)
    try {
      const nextCover = coverDraft.trim()
      const nextName = nameDraft.trim()
      const updated = await updatePlaylistApi(id, {
        name: nextName,
        coverImage: nextCover ? nextCover : null,
        isPublic: isPublicDraft,
      })
      updatePlaylist(id, { 
        name: updated.name, 
        coverImage: updated.coverImage ?? null,
        isPublic: updated.isPublic 
      })
      updateRecentMetadata(id, { name: updated.name, coverImage: updated.coverImage ?? null })
      setIsCoverOpen(false)
    } catch (err) {
      setCoverError((err as Error).message)
    } finally {
      setIsSavingCover(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await deletePlaylist(id)
      router.push('/')
    } catch (err) {
      setIsDeleting(false)
      setIsDeleteOpen(false)
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </MainLayout>
    )
  }

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
  const hasShareAccess =
    !!urlCode &&
    !currentPlaylist.isPublic &&
    !!currentPlaylist.shareEnabled &&
    !!currentPlaylist.shareCode &&
    currentPlaylist.shareCode === urlCode
  const canContribute = isOwner || hasShareAccess

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 bg-gradient-to-b from-purple-900/50 to-transparent px-4 py-6 md:flex-row md:items-end md:gap-6 md:px-6 md:py-8">
        <div className="mx-auto h-36 w-36 flex-shrink-0 overflow-hidden rounded-lg shadow-2xl md:mx-0 md:h-48 md:w-48">
          {currentPlaylist.coverImage && isLikelyImageSrc(currentPlaylist.coverImage) ? (
            <Image
              src={currentPlaylist.coverImage}
              alt={currentPlaylist.name}
              width={192}
              height={192}
              className="h-full w-full object-cover"
            />
          ) : currentPlaylist.coverImage ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-800 to-purple-600">
              <span className="text-6xl">{currentPlaylist.coverImage}</span>
            </div>
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

      <div className="flex flex-wrap items-center gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
        {songs.length > 0 && (
          <button
            onClick={() => playPlaylist(songs)}
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-spotify-green text-black shadow-lg shadow-spotify-green/20 transition-all hover:scale-105 hover:bg-[#1fdf64] active:scale-95"
            title="Reproduzir playlist"
          >
            <HiPlay className="ml-1 h-8 w-8" />
          </button>
        )}

        {canContribute && (
          <div className="flex items-center gap-5 md:gap-6">
            <button
              onClick={() => setIsAddSongOpen(true)}
              className="group flex flex-col items-center gap-1.5 text-white/50 transition-all hover:text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent transition-all group-hover:border-white group-hover:bg-white/10 group-active:scale-90">
                <HiPlus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar</span>
            </button>

            {isOwner && (
              <button
                onClick={openCoverModal}
                className="group flex flex-col items-center gap-1.5 text-white/50 transition-all hover:text-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent transition-all group-hover:border-white group-hover:bg-white/10 group-active:scale-90">
                  <HiPencil className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Editar</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => setIsImportOpen(true)}
                className="group flex flex-col items-center gap-1.5 text-white/50 transition-all hover:text-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent transition-all group-hover:border-white group-hover:bg-white/10 group-active:scale-90">
                  <HiPlus className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Importar YT</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => setIsShareOpen(true)}
                className="group flex flex-col items-center gap-1.5 text-white/50 transition-all hover:text-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent transition-all group-hover:border-white group-hover:bg-white/10 group-active:scale-90">
                  <HiGlobe className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Público</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={handleDelete}
                className="group flex flex-col items-center gap-1.5 text-red-500/50 transition-all hover:text-red-400"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/20 bg-transparent transition-all group-hover:border-red-500 group-hover:bg-red-500/10 group-active:scale-90">
                  <HiTrash className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Excluir</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-24 md:pb-8 md:px-6">
        <SongList
          songs={currentPlaylist.songs ?? []}
          canEdit={isOwner}
          onRemove={isOwner ? handleRemoveSong : undefined}
        />
      </div>

      {canContribute && (
        <AddSongModal
          isOpen={isAddSongOpen}
          onClose={() => setIsAddSongOpen(false)}
          playlistId={id}
          accessCode={!isOwner ? (urlCode || undefined) : undefined}
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
      {isOwner && isShareOpen && (
        <ShareModal
          playlistId={id}
          isOpen={true}
          onClose={() => setIsShareOpen(false)}
          isPublic={currentPlaylist.isPublic}
          initialShareEnabled={currentPlaylist.shareEnabled ?? false}
          initialShareCode={currentPlaylist.shareCode ?? null}
          onShareChanged={(enabled, code) =>
            updatePlaylist(id, code !== null
              ? { shareEnabled: enabled, shareCode: code }
              : { shareEnabled: enabled }
            )
          }
        />
      )}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        playlistName={currentPlaylist.name}
      />

      <Modal isOpen={isCoverOpen} onClose={() => setIsCoverOpen(false)} title="Editar Playlist">
        <form onSubmit={handleSaveCover} className="flex flex-col gap-4">
          <div>
            <label htmlFor="edit-name" className="mb-1.5 block text-sm font-medium text-white">
              Nome da playlist
            </label>
            <input
              id="edit-name"
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Nome da playlist"
              className="w-full rounded-md bg-spotify-hover px-3 py-2 text-sm text-white placeholder-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">Capa da playlist</label>
            <PlaylistCoverPicker value={coverDraft} onChange={setCoverDraft} />
          </div>
          {coverError && (
            <div className="rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm text-red-400">
              {coverError}
            </div>
          )}
          <div className="flex items-center justify-between rounded-md bg-spotify-hover px-4 py-3 mt-1">
            <div>
              <p className="text-sm font-medium text-white">Playlist Pública</p>
              <p className="text-xs text-spotify-text">Permite que outras pessoas encontrem esta playlist</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublicDraft(!isPublicDraft)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-spotify-green ${isPublicDraft ? 'bg-spotify-green' : 'bg-white/20'}`}
              aria-pressed={isPublicDraft}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublicDraft ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCoverOpen(false)}
              className="rounded-full px-5 py-2 text-sm font-semibold text-white hover:bg-spotify-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingCover}
              className="rounded-full bg-spotify-green px-6 py-2 text-sm font-bold text-black hover:scale-105 transition-transform disabled:opacity-60"
            >
              {isSavingCover ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
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
