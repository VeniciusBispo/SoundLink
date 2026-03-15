'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HiEye, HiEyeOff, HiCheck, HiX } from 'react-icons/hi'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import { register } from '@/services/authService'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_]+$/

interface PasswordRule {
  label: string
  pass: (v: string) => boolean
}

const passwordRules: PasswordRule[] = [
  { label: 'Pelo menos 8 caracteres', pass: (v) => v.length >= 8 },
  { label: 'Pelo menos uma letra maiúscula', pass: (v) => /[A-Z]/.test(v) },
  { label: 'Pelo menos um número', pass: (v) => /[0-9]/.test(v) },
]

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const passwordStrength = passwordRules.filter((r) => r.pass(password)).length
  const strengthLabel = ['Fraca', 'Média', 'Forte'][passwordStrength - 1] ?? ''
  const strengthColor = ['bg-red-500', 'bg-yellow-400', 'bg-spotify-green'][passwordStrength - 1] ?? 'bg-spotify-hover'

  const validate = () => {
    const errs: Record<string, string> = {}
    if (username.length < 3) errs.username = 'Mínimo de 3 caracteres.'
    else if (!USERNAME_RE.test(username)) errs.username = 'Apenas letras, números e _'
    if (!EMAIL_RE.test(email)) errs.email = 'E-mail inválido.'
    if (passwordStrength < 2) errs.password = 'Senha muito fraca.'
    if (password !== confirmPassword) errs.confirm = 'As senhas não coincidem.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await register({ username, email, password })
      if (result.emailSent) {
        router.push('/login?registered=1&emailSent=1')
      } else {
        router.push('/login?registered=1')
      }
    } catch (err) {
      setServerError((err as Error).message)
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
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          Criar conta gratuitamente
        </h1>

        {serverError && (
          <p className="mb-4 rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm text-red-400">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Username */}
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-white">
              Nome de usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="seunome"
              maxLength={30}
              className={`w-full rounded-xl bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 ${fieldErrors.username ? 'ring-2 ring-red-500' : 'focus:ring-spotify-green'}`}
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="seu@email.com"
              className={`w-full rounded-xl bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 ${fieldErrors.email ? 'ring-2 ring-red-500' : 'focus:ring-spotify-green'}`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full rounded-xl bg-spotify-hover px-3 py-2.5 pr-10 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 ${fieldErrors.password ? 'ring-2 ring-red-500' : 'focus:ring-spotify-green'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-text hover:text-white transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength bar */}
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
                {strengthLabel && (
                  <p className="text-xs text-spotify-text">Força: <span className="font-semibold text-white">{strengthLabel}</span></p>
                )}
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
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-white">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full rounded-xl bg-spotify-hover px-3 py-2.5 pr-10 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 ${fieldErrors.confirm ? 'ring-2 ring-red-500' : 'focus:ring-spotify-green'}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spotify-text hover:text-white transition-colors"
                aria-label={showConfirm ? 'Ocultar senha' : 'Ver senha'}
              >
                {showConfirm ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirm && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.confirm}</p>
            )}
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Criar conta
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-spotify-text">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-semibold text-white hover:text-spotify-green transition-colors">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}
