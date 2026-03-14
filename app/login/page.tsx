'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { HiMusicNote } from 'react-icons/hi'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-spotify-black px-4">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <HiMusicNote className="h-10 w-10 text-spotify-green" />
        <span className="text-2xl font-bold text-white">SoundLink</span>
      </Link>

      <div className="w-full max-w-sm rounded-lg bg-spotify-card px-8 py-10">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Log in to SoundLink</h1>

        {error && (
          <p className="mb-4 rounded-md bg-red-500/20 px-3 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-md bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-md bg-spotify-hover px-3 py-2.5 text-sm text-white placeholder-spotify-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Log In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-spotify-text">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-white hover:text-spotify-green transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
