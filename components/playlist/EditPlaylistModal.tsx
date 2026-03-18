'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const PlaylistCoverPicker = dynamic(() => import('@/components/playlist/PlaylistCoverPicker'), { ssr: false })
import { useUIStore } from '@/store/uiStore'
import { useMyPlaylists } from '@/hooks/usePlaylist'
import Modal from '@/components/ui/Modal'

export default function EditPlaylistModal() {
  // Assume que o store foi atualizado para suportar o estado de edição
  const isOpen = useUIStore((s) => s.isEditPlaylistModalOpen)
  const close = useUIStore((s) => s.closeEditPlaylistModal)
  const playlistToEdit = useUIStore((s) => s.playlistToEdit)
  
  // Assume que o hook useMyPlaylists expõe a função update
  const { update } = useMyPlaylists()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('') // URL, emoji ou data URL
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Preenche os campos quando a modal abre e existe uma playlist para editar
  useEffect(() => {
    if (isOpen && playlistToEdit) {
      setName(playlistToEdit.name)
      setDescription(playlistToEdit.description || '')
      setCoverImage(playlistToEdit.coverImage || '')
      setIsPublic(playlistToEdit.isPublic)
      setError('')
    }
  }, [isOpen, playlistToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('O nome da playlist é obrigatório')
      return
    }

    if (!playlistToEdit) return

    setIsLoading(true)
    setError('')

    try {
      await update(playlistToEdit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
        coverImage: coverImage.trim() || null
      })
      close()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title="Editar Playlist">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Campo para nome da playlist */}
        <div>
          <label htmlFor="edit-playlist-name" className="mb-1.5 block text-sm font-medium text-white">
            Nome da playlist
          </label>
          <input
            id="edit-playlist-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da playlist"
            className="w-full rounded-md bg-spotify-hover px-3 py-2 text-sm text-white placeholder-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
        </div>
        {/* Campo para imagem/avatar/emoji */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white">
            Capa da playlist
          </label>
          <PlaylistCoverPicker value={coverImage} onChange={setCoverImage} />
        </div>
        {error && (
          <p className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <div>
          <label htmlFor="edit-playlist-desc" className="mb-1.5 block text-sm font-medium text-white">
            Descrição
          </label>
          <textarea
            id="edit-playlist-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição da playlist"
            maxLength={300}
            rows={3}
            className="w-full resize-none rounded-md bg-spotify-hover px-3 py-2 text-sm text-white placeholder-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-spotify-hover peer-checked:bg-spotify-green transition-colors" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm text-white">Tornar playlist pública</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={close}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white hover:bg-spotify-hover transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-spotify-green px-6 py-2 text-sm font-bold text-black hover:scale-105 transition-transform disabled:opacity-60"
          >
            {isLoading ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}