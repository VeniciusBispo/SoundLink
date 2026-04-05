'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { HiEye, HiEyeOff, HiCheck, HiLightningBolt } from 'react-icons/hi'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import { generateStrongPassword } from '@/lib/password'

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
      <div className="w-full max-w-sm rounded-2xl bg-brand-card px-8 py-10 text-center">
        <p className="mb-4 text-brand-text">Link de redefinição inválido ou ausente.</p>
        <Link href="/forgot-password" className="font-bold text-brand-primary hover:underline">
          Solicitar novo link
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-2xl bg-brand-card px-8 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold text-white">Redefinir Senha</h1>

      {success ? (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-brand-primary/20 p-3">
              <HiCheck className="h-8 w-8 text-brand-primary" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white">Senha alterada!</h3>
          <p className="mt-2 text-brand-text">
            Você será redirecionado para o login em instantes...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-white">Nova Senha</label>
              <button
                type="button"
                onClick={() => {
                  const strong = generateStrongPassword()
                  setPassword(strong)
                  setConfirmPassword(strong)
                  setShowPassword(true)
                }}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary hover:underline"
              >
                <HiLightningBolt size={12} />
                Gerar senha forte
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-brand-hover px-3 py-2.5 text-sm text-white placeholder-brand-text/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text hover:text-white"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white">Confirmar Senha</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl bg-brand-hover px-3 py-2.5 text-sm text-white placeholder-brand-text/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Repita a nova senha"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Alterar Senha
          </Button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <Logo size={40} />
        <span className="text-2xl font-extrabold text-white">SoundLink</span>
      </Link>
      <Suspense fallback={<div className="text-white">Carregando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
