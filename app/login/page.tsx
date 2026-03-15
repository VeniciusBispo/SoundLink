'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { Suspense } from 'react'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      if (searchParams.get('emailSent') === '1') {
        setSuccess('Conta criada! Verifique seu e-mail para ativar a conta antes de entrar.')
      } else {
        setSuccess('Conta criada com sucesso! Você já pode entrar.')
      }
    }
    if (searchParams.get('verified') === '1') {
      setSuccess('E-mail confirmado com sucesso! Faça login abaixo.')
    }
    if (searchParams.get('error') === 'token_invalid') {
      setError('Link de verificação inválido ou expirado. Faça login para reenviar.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!identifier.trim()) {
      setError('Informe seu e-mail ou nome de usuário.')
      return
    }
    if (!password) {
      setError('Informe sua senha.')
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        identifier: identifier.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
        } else {
          setError('E-mail, nome de usuário ou senha incorretos.')
        }
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Algo deu errado. Tente novamente.')
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
          Entrar no SoundLink
        </h1>

        {success && (
          <p className="mb-4 rounded-xl bg-spotify-green/20 px-3 py-2 text-center text-sm text-spotify-green">
            {success}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-red-500/20 px-3 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-white">
              E-mail ou nome de usuário
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              placeholder="seunome ou seu@email.com"
              className="w-full rounded-xl bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
            />
          </div>

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
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl bg-spotify-hover px-3 py-2.5 pr-10 text-sm text-white placeholder-spotify-text/50 focus:outline-none focus:ring-2 focus:ring-spotify-green"
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
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-spotify-text">
          Não tem uma conta?{' '}
          <Link href="/register" className="font-semibold text-white hover:text-spotify-green transition-colors">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
