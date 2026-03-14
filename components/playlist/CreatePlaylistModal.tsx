'use client'

import { useState } from 'react'
import { HiX } from 'react-icons/hi'
import { useUIStore } from '@/store/uiStore'
import { useMyPlaylists } from '@/hooks/usePlaylist'
import Modal from '@/components/ui/Modal'

export default function CreatePlaylistModal() {
  const isOpen = useUIStore((s) => s.isCreatePlaylistModalOpen)
  const close = useUIStore((s) => s.closeCreatePlaylistModal)
  const { create } = useMyPlaylists()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Playlist name is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await create({ name: name.trim(), description: description.trim() || undefined, isPublic })
      setName('')
      setDescription('')
      setIsPublic(true)
      close()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title="Create Playlist">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-md bg-red-500/20 px-3 py-2 text-sm text-red-400">{error}</p>
        )}

        <div>
          <label htmlFor="playlist-name" className="mb-1.5 block text-sm font-medium text-white">
            Name *
          </label>
          <input
            id="playlist-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome playlist"
            maxLength={100}
            className="w-full rounded-md bg-spotify-hover px-3 py-2 text-sm text-white placeholder-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
            required
          />
        </div>

        <div>
          <label htmlFor="playlist-desc" className="mb-1.5 block text-sm font-medium text-white">
            Description
          </label>
          <textarea
            id="playlist-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Give your playlist a description"
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
          <span className="text-sm text-white">Make playlist public</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={close}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white hover:bg-spotify-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-spotify-green px-6 py-2 text-sm font-bold text-black hover:scale-105 transition-transform disabled:opacity-60"
          >
            {isLoading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
