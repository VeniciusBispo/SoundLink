'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HiLockOpen, HiArrowRight } from 'react-icons/hi'

export default function AccessPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const raw = input.trim()
    if (!raw) return

    setIsLoading(true)
    try {
      let playlistId: string | null = null
      let code: string | null = null

      if (raw.startsWith('http')) {
        // Full URL pasted — extract playlist id and code from it
        try {
          const url = new URL(raw)
          const match = url.pathname.match(/\/playlist\/([a-f0-9]{24})/i)
          if (match) playlistId = match[1]
          code = url.searchParams.get('code')?.toUpperCase() ?? null
        } catch {
          setError('Link inválido. Verifique e tente novamente.')
          return
        }
      } else {
        // Bare code typed directly
        code = raw.toUpperCase()
      }

      if (!code) {
        setError('Cole o link compartilhado ou insira o código de acesso.')
        return
      }

      // If we already know the playlist ID (from URL), go directly
      if (playlistId) {
        router.push(`/playlist/${playlistId}?code=${encodeURIComponent(code)}`)
        return
      }

      // Otherwise look up the playlist by code
      const res = await fetch(`/api/playlists/access?code=${encodeURIComponent(code)}`)
      const json = await res.json()

      if (!res.ok || !json.playlistId) {
        setError(json.error ?? 'Código inválido ou expirado. Verifique e tente novamente.')
        return
      }

      router.push(`/playlist/${json.playlistId}?code=${encodeURIComponent(code)}`)
    } catch {
      setError('Algo deu errado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
            <HiLockOpen className="h-8 w-8 text-brand-primary" />
          </div>
        </div>

        <h1 className="mb-1 text-center text-2xl font-bold text-white">
          Acessar playlist privada
        </h1>
        <p className="mb-8 text-center text-sm text-brand-text">
          Cole o link compartilhado ou insira o código de 8 dígitos.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError('')
            }}
            placeholder="Ex: A3F2B891 ou https://soundlink-app..."
            autoFocus
            spellCheck={false}
            className="w-full rounded-xl bg-brand-card px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-white placeholder:text-brand-text/40 focus:outline-none focus:ring-2 focus:ring-brand-primary uppercase"
          />

          {error && (
            <p className="rounded-xl bg-red-500/15 px-3 py-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 font-bold text-black transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                Acessar
                <HiArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-text">
          <Link href="/" className="hover:text-white transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
