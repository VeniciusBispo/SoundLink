'use client'

import { useEffect, useState, useCallback } from 'react'

export interface RecentPlaylist {
  id: string
  name: string
  coverImage: string | null
  ownerUsername: string
  songCount: number
  visitedAt: number
}

const KEY = 'soundlink:recent_playlists'
const MAX = 6

function load(): RecentPlaylist[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useRecentPlaylists() {
  const [recent, setRecent] = useState<RecentPlaylist[]>([])

  useEffect(() => {
    setRecent(load())

    const handleUpdate = () => {
      setRecent(load())
    }

    // Ouve as atualizações que vêm da mesma aba/janela
    window.addEventListener('recent_playlists_changed', handleUpdate)
    // Ouve se for atualizado em outra aba
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) handleUpdate()
    })

    return () => {
      window.removeEventListener('recent_playlists_changed', handleUpdate)
    }
  }, [])

  const push = useCallback((entry: Omit<RecentPlaylist, 'visitedAt'>) => {
    const next: RecentPlaylist = { ...entry, visitedAt: Date.now() }
    const filtered = load().filter((p) => p.id !== entry.id)
    const updated = [next, ...filtered].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
    setRecent(updated)
    window.dispatchEvent(new Event('recent_playlists_changed'))
  }, [])

  const updateMetadata = useCallback((id: string, updates: Partial<RecentPlaylist>) => {
    const current = load()
    const index = current.findIndex((p) => p.id === id)
    if (index === -1) return
    current[index] = { ...current[index], ...updates }
    localStorage.setItem(KEY, JSON.stringify(current))
    setRecent(current)
    window.dispatchEvent(new Event('recent_playlists_changed'))
  }, [])

  return { recent, push, updateMetadata }
}
