import { openDB, type IDBPDatabase } from 'idb'
import type { Song, Playlist, OfflinePlaylistRecord, StorageEstimate } from '@/types'

const DB_NAME = 'soundlink-offline'
const DB_VERSION = 1

let _db: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db

  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('songs')) {
        database.createObjectStore('songs', { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains('offlinePlaylists')) {
        database.createObjectStore('offlinePlaylists', { keyPath: 'playlistId' })
      }
    },
  })

  return _db
}

// ─── Save / remove playlists offline ──────────────────────────────────────────

export async function savePlaylistOffline(playlist: Playlist, songs: Song[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['songs', 'offlinePlaylists'], 'readwrite')

  for (const song of songs) {
    await tx.objectStore('songs').put(song)
  }

  const record: OfflinePlaylistRecord = {
    playlistId: playlist.id,
    playlist,
    songIds: songs.map((s) => s.id),
    savedAt: new Date().toISOString(),
  }

  await tx.objectStore('offlinePlaylists').put(record)
  await tx.done
}

export async function removeOfflinePlaylist(playlistId: string): Promise<void> {
  const db = await getDB()
  await db.delete('offlinePlaylists', playlistId)
}

// ─── Query ─────────────────────────────────────────────────────────────────────

export async function isPlaylistOffline(playlistId: string): Promise<boolean> {
  const db = await getDB()
  const record = await db.get('offlinePlaylists', playlistId)
  return !!record
}

export async function getOfflinePlaylist(playlistId: string): Promise<import('@/types').Playlist | null> {
  try {
    const db = await getDB()
    const record: OfflinePlaylistRecord | undefined = await db.get('offlinePlaylists', playlistId)
    if (!record) return null
    const songs = await Promise.all(
      record.songIds.map((id) => db.get('songs', id) as Promise<Song | undefined>)
    )
    const validSongs = songs.filter((s): s is Song => !!s)
    return {
      ...record.playlist,
      songs: validSongs.map((song, index) => ({
        playlistId,
        songId: song.id,
        orderIndex: index,
        addedAt: new Date(record.savedAt),
        song,
      })),
    }
  } catch {
    return null
  }
}

export async function getAllOfflinePlaylists(): Promise<OfflinePlaylistRecord[]> {
  const db = await getDB()
  return db.getAll('offlinePlaylists')
}

export async function getOfflineSongs(playlistId: string): Promise<Song[]> {
  const db = await getDB()
  const record: OfflinePlaylistRecord | undefined = await db.get(
    'offlinePlaylists',
    playlistId
  )
  if (!record) return []

  const songs = await Promise.all(
    record.songIds.map((id) => db.get('songs', id) as Promise<Song | undefined>)
  )
  return songs.filter((s): s is Song => !!s)
}

// ─── Storage info ──────────────────────────────────────────────────────────────

export async function getStorageEstimate(): Promise<StorageEstimate> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return { usage: 0, quota: 0 }
  }
  const { usage = 0, quota = 0 } = await navigator.storage.estimate()
  return { usage, quota }
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}
