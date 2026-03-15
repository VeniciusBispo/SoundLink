'use client'

import { HiExclamation, HiX } from 'react-icons/hi'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
  playlistName: string
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  playlistName,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
      onClick={(e) => e.target === e.currentTarget && !isDeleting && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-spotify-card p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
              <HiExclamation className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-base font-bold text-white">Excluir playlist</h2>
          </div>
          {!isDeleting && (
            <button
              onClick={onClose}
              className="rounded-full p-1 text-spotify-text hover:bg-spotify-hover hover:text-white transition-colors"
            >
              <HiX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <p className="mb-1 text-sm text-spotify-text">
          Tem certeza que deseja excluir a playlist
        </p>
        <p className="mb-5 truncate text-sm font-semibold text-white">
          &ldquo;{playlistName}&rdquo;?
        </p>
        <p className="mb-5 text-xs text-spotify-text">
          Esta ação não pode ser desfeita. Todas as músicas serão removidas da playlist.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-spotify-hover bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-spotify-hover disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Excluindo...
              </span>
            ) : (
              'Excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
