'use client'

import { useState } from 'react'
import { HiX, HiClipboard, HiCheck } from 'react-icons/hi'
import { enableShare, disableShare } from '@/services/playlistService'

interface ShareModalProps {
  playlistId: string
  isOpen: boolean
  onClose: () => void
  initialShareEnabled: boolean
  initialShareCode: string | null
}

export default function ShareModal({
  playlistId,
  isOpen,
  onClose,
  initialShareEnabled,
  initialShareCode,
}: ShareModalProps) {
  const [shareEnabled, setShareEnabled] = useState(initialShareEnabled)
  const [shareCode, setShareCode] = useState<string | null>(initialShareCode)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<'link' | 'code' | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = shareCode ? `${origin}/playlist/${playlistId}?code=${shareCode}` : null

  const copyToClipboard = async (text: string, field: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (shareEnabled) {
        await disableShare(playlistId)
        setShareEnabled(false)
      } else {
        const { shareCode: code } = await enableShare(playlistId)
        setShareEnabled(true)
        setShareCode(code)
      }
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-spotify-card p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Compartilhar playlist</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-spotify-text hover:bg-spotify-hover hover:text-white transition-colors"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* Toggle */}
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl bg-spotify-dark p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Compartilhamento por código</p>
            <p className="mt-0.5 text-xs text-spotify-text">
              Permite que pessoas com o código acessem esta playlist privada
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={isLoading}
            aria-label={shareEnabled ? 'Desativar compartilhamento' : 'Ativar compartilhamento'}
            className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
              shareEnabled ? 'bg-spotify-green' : 'bg-spotify-hover'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                shareEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Share details — only when enabled */}
        {shareEnabled && shareCode && shareUrl && (
          <div className="space-y-3">
            {/* Link row */}
            <div className="rounded-xl bg-spotify-dark p-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-spotify-text">
                Link de acesso
              </p>
              <div className="flex items-center gap-2">
                <p className="flex-1 truncate text-sm text-white">{shareUrl}</p>
                <button
                  onClick={() => copyToClipboard(shareUrl, 'link')}
                  className="flex-shrink-0 rounded-lg bg-spotify-hover p-1.5 text-white hover:bg-white/20 transition-colors"
                  title="Copiar link"
                >
                  {copiedField === 'link' ? (
                    <HiCheck className="h-4 w-4 text-spotify-green" />
                  ) : (
                    <HiClipboard className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Code row */}
            <div className="rounded-xl bg-spotify-dark p-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-spotify-text">
                Código de acesso
              </p>
              <div className="flex items-center gap-2">
                <p className="flex-1 font-mono text-2xl font-bold tracking-widest text-spotify-green">
                  {shareCode}
                </p>
                <button
                  onClick={() => copyToClipboard(shareCode, 'code')}
                  className="flex-shrink-0 rounded-lg bg-spotify-hover p-1.5 text-white hover:bg-white/20 transition-colors"
                  title="Copiar código"
                >
                  {copiedField === 'code' ? (
                    <HiCheck className="h-4 w-4 text-spotify-green" />
                  ) : (
                    <HiClipboard className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-spotify-text">
              Envie o link e o código para quem você quer dar acesso
            </p>
          </div>
        )}

        {!shareEnabled && (
          <p className="text-center text-sm text-spotify-text">
            Ative o compartilhamento para gerar um link e código de acesso.
          </p>
        )}
      </div>
    </div>
  )
}
