'use client'

import { useState } from 'react'
import { HiX, HiChat, HiCheckCircle } from 'react-icons/hi'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), email: email.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao enviar feedback')
      } else {
        setSent(true)
        setMessage('')
        setEmail('')
      }
    } catch {
      setError('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSent(false)
    setError('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-spotify-dark p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-spotify-text hover:bg-white/10 hover:text-white transition-colors"
        >
          <HiX className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-green/20">
            <HiChat className="h-5 w-5 text-spotify-green" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Enviar feedback</h2>
            <p className="text-xs text-spotify-text">Sua opinião melhora o SoundLink</p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <HiCheckCircle className="h-12 w-12 text-spotify-green" />
            <p className="text-base font-semibold text-white">Feedback enviado!</p>
            <p className="text-sm text-spotify-text">Obrigado pela sua mensagem.</p>
            <button
              onClick={handleClose}
              className="mt-2 rounded-full bg-spotify-green px-6 py-2 text-sm font-bold text-black hover:bg-green-400 transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                Sua mensagem <span className="text-spotify-green">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conta pra gente o que você achou, o que pode melhorar..."
                rows={4}
                maxLength={2000}
                className="w-full resize-none rounded-xl bg-[#2a2a2a] px-4 py-3 text-sm text-white placeholder-spotify-text outline-none ring-1 ring-white/10 transition focus:ring-spotify-green"
              />
              <p className="mt-1 text-right text-xs text-spotify-text">
                {message.length}/2000
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white">
                E-mail <span className="text-spotify-text">(opcional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="para receber uma resposta"
                className="w-full rounded-xl bg-[#2a2a2a] px-4 py-2.5 text-sm text-white placeholder-spotify-text outline-none ring-1 ring-white/10 transition focus:ring-spotify-green"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full rounded-full bg-spotify-green py-3 text-sm font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
