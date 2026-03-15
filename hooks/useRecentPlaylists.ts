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
  }, [])

  const push = useCallback((entry: Omit<RecentPlaylist, 'visitedAt'>) => {
    const next: RecentPlaylist = { ...entry, visitedAt: Date.now() }
    const filtered = load().filter((p) => p.id !== entry.id)
    const updated = [next, ...filtered].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
    setRecent(updated)
  }, [])

  return { recent, push }
}
