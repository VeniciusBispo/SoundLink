'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HiMail, HiCheckCircle, HiUser } from 'react-icons/hi'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !username) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar e-mail')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
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
        {success ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-spotify-green/20 p-3">
                <HiCheckCircle className="h-8 w-8 text-spotify-green" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">E-mail enviado!</h2>
            <p className="mt-2 text-sm text-spotify-text">
              Enviamos um link de recuperação para o seu e-mail. Por favor, verifique sua caixa de entrada e spam.
            </p>
            <Link
              href="/login"
              className="mt-6 block font-bold text-spotify-green hover:underline"
            >
              Voltar para Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-center text-2xl font-bold text-white">Recuperar Senha</h1>
            <p className="mb-6 text-center text-sm text-spotify-text">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                  Nome de Usuário
                </label>
                <div className="relative">
                  <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-text" size={18} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl bg-spotify-hover py-2.5 pl-10 pr-3 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                    placeholder="Seu nome de usuário"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white">
                  E-mail
                </label>
                <div className="relative">
                  <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-text" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-spotify-hover py-2.5 pl-10 pr-3 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
                Enviar Link de Recuperação
              </Button>

              <p className="text-center text-sm text-spotify-text">
                Lembrou a senha?{' '}
                <Link href="/login" className="font-bold text-white hover:underline">
                  Fazer login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}