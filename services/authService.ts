import type { RegisterInput } from '@/types'

/**
 * Register a new user account.
 */
export async function register(input: RegisterInput) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Registration failed')
  return json as { data: unknown; emailSent: boolean }
}

/**
 * Get the current user's profile.
 */
export async function getProfile() {
  const res = await fetch('/api/profile')
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to load profile')
  return json.data
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(data: { username?: string; avatar?: string; banner?: string }) {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to update profile')
  return json.data
}
