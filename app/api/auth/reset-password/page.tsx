// c:\Users\vinic\Desktop\Musicnews\app\reset-password\page.tsx
'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { HiEye, HiEyeOff, HiCheck, HiX } from 'react-icons/hi'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

interface PasswordRule {
  label: string
  pass: (v: string) => boolean
}

const passwordRules: PasswordRule[] = [
  { label: 'Pelo menos 8 caracteres', pass: (v) => v.length >= 8 },
  { label: 'Pelo menos uma letra maiúscula', pass: (v) => /[A-Z]/.test(v) },
  { label: 'Pelo menos um número', pass: (v) => /[0-9]/.test(v) },
]

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const passwordStrength = passwordRules.filter((r) => r.pass(password)).length
  const strengthColor = ['bg-red-500', 'bg-yellow-400', 'bg-spotify-green'][passwordStrength - 1] ?? 'bg-spotify-hover'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token inválido ou ausente.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 8) {
       setError('A senha deve ter no mínimo 8 caracteres.')
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
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha')

      setSuccess(true)
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 3000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-2xl bg-spotify-card px-8 py-10 text-center">
        <p className="mb-4 text-white">Link inválido ou ausente.</p>
        <Link href="/login" className="text-spotify-green hover:underline">Ir para Login</Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-2xl bg-spotify-card px-8 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold text-white">
        Nova Senha
      </h1>

      {success ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-spotify-green/20">
            <HiCheck className="h-8 w-8 text-spotify-green" />
          </div>
          <h3 className="text-lg font-bold text-white">Senha alterada!</h3>
          <p className="mt-2 text-sm text-spotify-text">
            Redirecionando para o login...
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
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white">
              Nova senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl bg-spotify-hover px-3 py-2.5 pr-10 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-text hover:text-white transition-colors"
              >
                {showPassword ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
              </button>
            </div>
            
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < passwordStrength ? strengthColor : 'bg-spotify-hover'}`}
                    />
                  ))}
                </div>
                <ul className="space-y-0.5">
                  {passwordRules.map((rule) => (
                    <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${rule.pass(password) ? 'text-spotify-green' : 'text-spotify-text'}`}>
                      {rule.pass(password) ? <HiCheck className="h-3 w-3" /> : <HiX className="h-3 w-3" />}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-white">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl bg-spotify-hover px-3 py-2.5 pr-10 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-text hover:text-white transition-colors"
              >
                {showConfirm ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Alterar senha
          </Button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-spotify-black px-4 py-10">
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
