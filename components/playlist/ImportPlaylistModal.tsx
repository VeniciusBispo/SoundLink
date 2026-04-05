'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { HiX, HiMusicNote, HiCheck } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import { usePlaylistStore } from '@/store/playlistStore'
import { formatDuration } from '@/lib/utils'
import YouTubeLinkHelper from '@/components/ui/YouTubeLinkHelper'

interface VideoItem {
  videoId: string
  title: string
  thumbnail: string
  channel: string
  duration: number
}

interface ImportPlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  playlistId: string
  existingVideoIds?: Set<string>
}

export default function ImportPlaylistModal({
  isOpen,
  onClose,
  playlistId,
  existingVideoIds = new Set(),
}: ImportPlaylistModalProps) {
  const [url, setUrl] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [items, setItems] = useState<VideoItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)
  const setCurrentPlaylist = usePlaylistStore((s) => s.setCurrentPlaylist)
  const currentPlaylist = usePlaylistStore((s) => s.currentPlaylist)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    setUrl('')
    setFetchError('')
    setPlaylistTitle('')
    setItems([])
    setSelected(new Set())
    setImportResult(null)
    onClose()
  }

  const handleFetch = async () => {
    if (!url.trim()) return
    setIsFetching(true)
    setFetchError('')
    setItems([])
    setSelected(new Set())
    setImportResult(null)
    try {
      const res = await fetch(`/api/youtube/playlist?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao buscar playlist')
      setPlaylistTitle(data.playlistTitle ?? '')
      setItems(data.items ?? [])
      // Select all non-duplicate items by default
      setSelected(
        new Set(
          (data.items as VideoItem[])
            .filter((i) => !existingVideoIds.has(i.videoId))
            .map((i) => i.videoId)
        )
      )
    } catch (err) {
      setFetchError((err as Error).message)
    } finally {
      setIsFetching(false)
    }
  }

  const toggleItem = (videoId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(videoId)) next.delete(videoId)
      else next.add(videoId)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(items.filter((i) => !existingVideoIds.has(i.videoId)).map((i) => i.videoId)))
  const deselectAll = () => setSelected(new Set())

  const newItemsCount = items.filter((i) => !existingVideoIds.has(i.videoId)).length
  const duplicatesCount = items.length - newItemsCount

  const handleImport = async () => {
    if (selected.size === 0) return
    setIsImporting(true)
    setFetchError('')
    try {
      const songs = items
        .filter((i) => selected.has(i.videoId))
        .map((i) => ({
          videoId: i.videoId,
          title: i.title,
          thumbnail: i.thumbnail,
          channel: i.channel,
          duration: i.duration,
        }))

      const res = await fetch(`/api/playlists/${playlistId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao importar')
      setImportResult({ imported: data.imported, skipped: data.skipped })

      // Refresh playlist store
      const updated = await fetch(`/api/playlists/${playlistId}`)
      if (updated.ok) {
        const pl = await updated.json()
        setCurrentPlaylist(pl.data ?? pl)
      }
    } catch (err) {
      setFetchError((err as Error).message)
    } finally {
      setIsImporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Importar playlist do YouTube"
        className="relative flex w-full max-w-2xl flex-col rounded-xl bg-brand-card shadow-2xl"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Importar playlist do YouTube</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-brand-text transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* URL input */}
        <div className="px-6 pt-4 pb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleFetch() }}
              placeholder="https://www.youtube.com/playlist?list=..."
              className="min-w-0 flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-brand-text/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleFetch}
              isLoading={isFetching}
              className="shrink-0"
            >
              Buscar
            </Button>
          </div>
          {fetchError && (
            <div className="mt-3 rounded-lg bg-red-400/10 p-3">
              <p className="text-xs text-red-400 font-medium">{fetchError}</p>
              <ul className="mt-2 text-[10px] text-red-400/70 list-disc list-inside space-y-1">
                <li>Certifique-se que a playlist é <strong>Pública</strong> ou <strong>Não Listada</strong>.</li>
                <li>Links de &quot;Mix&quot; ou &quot;Rádio&quot; não são suportados.</li>
                <li>Tente copiar o link diretamente da página da playlist.</li>
              </ul>
            </div>
          )}
          <YouTubeLinkHelper mode="playlist" />
        </div>

        {/* Results */}
        {items.length > 0 && !importResult && (
          <>
            {/* Playlist title + controls */}
            <div className="flex items-center justify-between px-6 pb-2">
              <div>
                {playlistTitle && (
                  <p className="text-sm font-semibold text-white truncate max-w-xs">{playlistTitle}</p>
                )}
                <p className="text-xs text-brand-text">
                  {items.length} vídeos encontrados
                  {duplicatesCount > 0 && (
                    <span className="ml-1 text-yellow-400">· {duplicatesCount} já na playlist</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-brand-primary hover:underline"
                >
                  Todos
                </button>
                <span className="text-xs text-brand-text">/</span>
                <button
                  onClick={deselectAll}
                  className="text-xs text-brand-text hover:text-white"
                >
                  Nenhum
                </button>
              </div>
            </div>

            {/* Song list */}
            <div className="mx-6 mb-3 overflow-y-auto rounded-lg border border-white/10" style={{ maxHeight: '40vh' }}>
              {items.map((item) => {
                const checked = selected.has(item.videoId)
                const isDuplicate = existingVideoIds.has(item.videoId)
                return (
                  <label
                    key={item.videoId}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors hover:bg-white/5 ${
                      isDuplicate ? 'opacity-50' : checked ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(item.videoId)}
                      className="h-4 w-4 shrink-0 accent-brand-primary"
                    />
                    {/* Thumbnail */}
                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/10">
                          <HiMusicNote className="h-4 w-4 text-brand-text" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{item.title}</p>
                      <p className="truncate text-xs text-brand-text">{item.channel}</p>
                    </div>
                    {/* Duplicate badge OR duration */}
                    {isDuplicate ? (
                      <span className="shrink-0 rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                        Na playlist
                      </span>
                    ) : item.duration > 0 ? (
                      <span className="shrink-0 text-xs text-brand-text">
                        {formatDuration(item.duration)}
                      </span>
                    ) : null}
                  </label>
                )
              })}
            </div>

            {/* Import button */}
            <div className="px-6 pb-5">
              <Button
                variant="primary"
                size="md"
                onClick={handleImport}
                isLoading={isImporting}
                disabled={selected.size === 0}
                className="w-full"
              >
                Importar {selected.size > 0 ? `${selected.size} música${selected.size !== 1 ? 's' : ''}` : 'selecionadas'}
                {duplicatesCount > 0 && selected.size === 0 && newItemsCount > 0 && (
                  <span className="ml-1 text-xs opacity-70">({newItemsCount} novas disponíveis)</span>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Success state */}
        {importResult && (
          <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/20">
              <HiCheck className="h-8 w-8 text-brand-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Importação concluída!</p>
              <p className="mt-1 text-sm text-brand-text">
                <span className="font-semibold text-white">{importResult.imported}</span>{' '}
                {importResult.imported === 1 ? 'música adicionada' : 'músicas adicionadas'}
                {importResult.skipped > 0 && (
                  <> · {importResult.skipped} {importResult.skipped === 1 ? 'já existia' : 'já existiam'}</>
                )}
              </p>
            </div>
            <Button variant="primary" size="md" onClick={handleClose} className="mt-2">
              Fechar
            </Button>
          </div>
        )}

        {/* Empty state after fetch */}
        {!isFetching && items.length === 0 && !fetchError && url && (
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-brand-text">Nenhum vídeo encontrado nesta playlist.</p>
          </div>
        )}
      </div>
    </div>
  )
}
