// c:\Users\vinic\Desktop\Musicnews\app\forgot-password\page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HiArrowLeft, HiCheck } from 'react-icons/hi'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (res.ok) {
        setIsSent(true)
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao solicitar recuperação')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-spotify-black px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <Logo size={40} />
        <span className="text-2xl font-extrabold text-white">SoundLink</span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl bg-spotify-card px-8 py-10">
        <Link
          href="/login"
          className="mb-6 flex items-center gap-2 text-sm text-spotify-text hover:text-white transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" />
          Voltar para login
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-white">Recuperar senha</h1>
        <p className="mb-6 text-sm text-spotify-text">
          Informe seu e-mail para receber um link de redefinição.
        </p>

        {isSent ? (
          <div className="flex flex-col items-center rounded-xl bg-spotify-green/10 p-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-spotify-green">
              <HiCheck className="h-6 w-6 text-black" />
            </div>
            <h3 className="mb-1 font-bold text-white">Verifique seu e-mail</h3>
            <p className="text-sm text-spotify-text">
              Enviamos um link para <strong>{email}</strong>.
            </p>
            <p className="mt-4 text-xs text-spotify-text/60">
              Pode levar alguns minutos. Verifique também sua caixa de spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm text-red-400">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full rounded-xl bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
              Enviar link
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
