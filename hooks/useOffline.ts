'use client'

import { useEffect, useState } from 'react'
import { isPlaylistOffline, savePlaylistOffline, removeOfflinePlaylist, getStorageEstimate, isOnline } from '@/services/offlineService'
import type { Playlist, Song, StorageEstimate } from '@/types'

export function useOffline() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(isOnline())
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline: online }
}

export function useOfflinePlaylist(playlistId: string) {
  const [isOffline, setIsOffline] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [storage, setStorage] = useState<StorageEstimate>({ usage: 0, quota: 0 })

  useEffect(() => {
    isPlaylistOffline(playlistId).then(setIsOffline)
    getStorageEstimate().then(setStorage)
  }, [playlistId])

  const save = async (playlist: Playlist, songs: Song[]) => {
    setIsSaving(true)
    try {
      await savePlaylistOffline(playlist, songs)
      // Also pre-cache the API response in the SW cache so the playlist
      // loads correctly offline even without a prior page visit.
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open('offlineCache')
          await cache.add(`/api/playlists/${playlist.id}`)
        } catch {
          // SW may not be available in dev — ignore silently
        }
      }
      setIsOffline(true)
      setStorage(await getStorageEstimate())
    } finally {
      setIsSaving(false)
    }
  }

  const remove = async () => {
    await removeOfflinePlaylist(playlistId)
    setIsOffline(false)
    setStorage(await getStorageEstimate())
  }

  return { isOffline, isSaving, storage, save, remove }
}
