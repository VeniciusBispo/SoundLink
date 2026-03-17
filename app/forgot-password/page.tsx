// c:\Users\vinic\Desktop\Musicnews\app\reset-password\page.tsx
'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { HiEye, HiEyeOff, HiCheck } from 'react-icons/hi'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token inválido ou ausente.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#121212] px-4 text-white">
        <div className="w-full max-w-md rounded-lg bg-[#181818] p-8 text-center shadow-lg">
          <p className="mb-4 text-gray-300">Link de redefinição inválido ou ausente.</p>
          <Link href="/login" className="font-bold text-[#1DB954] hover:underline">
            Voltar para Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#121212] px-4 text-white">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">SoundLink</h1>
      </div>

      <div className="w-full max-w-md rounded-lg bg-[#181818] p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold">Redefinir Senha</h2>

        {success ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-900/30 p-3">
                <HiCheck className="h-8 w-8 text-[#1DB954]" />
              </div>
            </div>
            <h3 className="text-xl font-bold">Senha alterada!</h3>
            <p className="mt-2 text-gray-400">Você será redirecionado para o login em instantes...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-500">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-gray-600 bg-[#282828] p-3 text-white placeholder-gray-400 focus:border-[#1DB954] focus:outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Confirmar Senha
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-gray-600 bg-[#282828] p-3 text-white placeholder-gray-400 focus:border-[#1DB954] focus:outline-none"
                placeholder="Repita a nova senha"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-full bg-[#1DB954] py-3 font-bold text-black transition hover:bg-[#1ed760] hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#121212] text-white">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
