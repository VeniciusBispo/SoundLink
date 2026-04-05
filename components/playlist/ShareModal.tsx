'use client'

import { useEffect, useState } from 'react'
import { HiX, HiClipboard, HiCheck } from 'react-icons/hi'
import { enableShare, disableShare } from '@/services/playlistService'

interface ShareModalProps {
  playlistId: string
  isOpen: boolean
  onClose: () => void
  isPublic: boolean
  initialShareEnabled: boolean
  initialShareCode: string | null
  onShareChanged?: (shareEnabled: boolean, shareCode: string | null) => void
}

export default function ShareModal({
  playlistId,
  isOpen,
  onClose,
  isPublic,
  initialShareEnabled,
  initialShareCode,
  onShareChanged,
}: ShareModalProps) {
  const [shareEnabled, setShareEnabled] = useState(initialShareEnabled)
  const [shareCode, setShareCode] = useState<string | null>(initialShareCode)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<'link' | 'code' | 'public' | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin.replace(/\.$/, '') : ''
  const publicUrl = `${origin}/playlist/${playlistId}`
  const privateUrl = shareCode ? `${origin}/playlist/${playlistId}?code=${shareCode}` : ''

  // If somehow shareEnabled=true but code is missing, auto-generate on open
  useEffect(() => {
    if (isPublic || !initialShareEnabled || initialShareCode) return
    setIsLoading(true)
    enableShare(playlistId)
      .then(({ shareCode: code }) => {
        setShareCode(code)
        onShareChanged?.(true, code)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copyToClipboard = async (text: string, field: 'link' | 'code' | 'public') => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (shareEnabled) {
        await disableShare(playlistId)
        setShareEnabled(false)
        setShareCode(null)
        onShareChanged?.(false, null)
      } else {
        const { shareCode: code } = await enableShare(playlistId)
        setShareEnabled(true)
        setShareCode(code)
        onShareChanged?.(true, code)
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
      <div className="w-full max-w-md rounded-2xl bg-brand-card p-5 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Compartilhar playlist</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-brand-text hover:bg-brand-hover hover:text-white transition-colors"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* ── PUBLIC playlist: just show the direct link ── */}
        {isPublic ? (
          <div className="rounded-xl bg-brand-dark p-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-text">
              Link da playlist
            </p>
            <div className="flex items-center gap-2">
              <p className="flex-1 truncate text-sm text-white">{publicUrl}</p>
              <button
                onClick={() => copyToClipboard(publicUrl, 'public')}
                className="flex-shrink-0 rounded-lg bg-brand-hover p-1.5 text-white hover:bg-white/20 transition-colors"
                title="Copiar link"
              >
                {copiedField === 'public' ? (
                  <HiCheck className="h-4 w-4 text-brand-primary" />
                ) : (
                  <HiClipboard className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ── PRIVATE playlist: toggle + code ── */
          <>
            {/* Toggle row */}
            <div className="mb-4 flex items-center justify-between gap-4 rounded-xl bg-brand-dark p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Compartilhamento por código</p>
                <p className="mt-0.5 text-xs text-brand-text">
                  Gera um link e código para dar acesso a esta playlist privada
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={isLoading}
                role="switch"
                aria-checked={shareEnabled}
                aria-label={shareEnabled ? 'Desativar compartilhamento' : 'Ativar compartilhamento'}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-card disabled:cursor-not-allowed disabled:opacity-50 ${
                  shareEnabled ? 'border-brand-primary bg-brand-primary' : 'border-white/10 bg-white/10'
                }`}
              >
                <span
                  className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                    shareEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                >
                  {isLoading && (
                    <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-brand-primary border-t-transparent" />
                  )}
                </span>
              </button>
            </div>

            {/* Share details */}
            {shareEnabled && shareCode && (
              <div className="space-y-3">
                {/* Link row */}
                <div className="rounded-xl bg-brand-dark p-3">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-text">
                    Link de acesso
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 truncate text-sm text-white">{privateUrl}</p>
                    <button
                      onClick={() => copyToClipboard(privateUrl, 'link')}
                      className="flex-shrink-0 rounded-lg bg-brand-hover p-1.5 text-white hover:bg-white/20 transition-colors"
                      title="Copiar link"
                    >
                      {copiedField === 'link' ? (
                        <HiCheck className="h-4 w-4 text-brand-primary" />
                      ) : (
                        <HiClipboard className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Code row */}
                <div className="rounded-xl bg-brand-dark p-3">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-text">
                    Código de acesso
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 font-mono text-2xl font-bold tracking-widest text-brand-primary">
                      {shareCode}
                    </p>
                    <button
                      onClick={() => copyToClipboard(shareCode, 'code')}
                      className="flex-shrink-0 rounded-lg bg-brand-hover p-1.5 text-white hover:bg-white/20 transition-colors"
                      title="Copiar código"
                    >
                      {copiedField === 'code' ? (
                        <HiCheck className="h-4 w-4 text-brand-primary" />
                      ) : (
                        <HiClipboard className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-center text-xs text-brand-text">
                  Envie o link e o código para quem você quer dar acesso
                </p>
              </div>
            )}

            {!shareEnabled && (
              <p className="text-center text-sm text-brand-text">
                Ative o compartilhamento para gerar um link e código de acesso.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
