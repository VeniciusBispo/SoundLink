'use client'

import { useEffect } from 'react'
import { usePlaylistStore } from '@/store/playlistStore'
import * as playlistService from '@/services/playlistService'
import type { CreatePlaylistInput } from '@/types'

/**
 * Loads the current user's playlists on mount and exposes CRUD actions.
 */
export function useMyPlaylists() {
  const { playlists, isLoading, error, setPlaylists, addPlaylist, updatePlaylist, removePlaylist, setLoading, setError } =
    usePlaylistStore()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    playlistService
      .getMyPlaylists()
      .then((data) => {
        if (!cancelled) setPlaylists(data)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const create = async (input: CreatePlaylistInput) => {
    const playlist = await playlistService.createPlaylist(input)
    addPlaylist(playlist)
    return playlist
  }

  const update = async (id: string, input: Partial<CreatePlaylistInput>) => {
    const playlist = await playlistService.updatePlaylist(id, input)
    updatePlaylist(id, playlist)
    return playlist
  }

  const remove = async (id: string) => {
    await playlistService.deletePlaylist(id)
    removePlaylist(id)
  }

  return { playlists, isLoading, error, create, update, remove }
}
