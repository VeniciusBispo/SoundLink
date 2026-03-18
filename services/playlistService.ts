import type { Playlist, CreatePlaylistInput, PaginatedResponse } from '@/types'

const BASE = '/api/playlists'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Request failed')
  return json.data as T
}

export async function getPublicPlaylists(
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Playlist>> {
  const res = await fetch(`${BASE}?page=${page}&pageSize=${pageSize}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Request failed')
  return json as PaginatedResponse<Playlist>
}

export async function getMyPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${BASE}?mine=true`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Request failed')
  return json.data as Playlist[]
}

export async function getPlaylist(id: string, code?: string): Promise<Playlist> {
  const url = code ? `${BASE}/${id}?code=${encodeURIComponent(code)}` : `${BASE}/${id}`
  return request<Playlist>(url)
}

export async function enableShare(id: string): Promise<{ shareCode: string }> {
  return request<{ shareCode: string }>(`${BASE}/${id}/share`, { method: 'POST' })
}

export async function disableShare(id: string): Promise<void> {
  await request(`${BASE}/${id}/share`, { method: 'DELETE' })
}

export async function createPlaylist(input: CreatePlaylistInput): Promise<Playlist> {
  return request<Playlist>(BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updatePlaylist(
  id: string,
  input: Partial<CreatePlaylistInput>
): Promise<Playlist> {
  return request<Playlist>(`${BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deletePlaylist(id: string): Promise<void> {
  await request(`${BASE}/${id}`, { method: 'DELETE' })
}

export async function addSongToPlaylist(
  playlistId: string,
  song: {
    youtubeVideoId: string
    title: string
    duration: number
    thumbnail: string
    channel: string
  },
  code?: string
) {
  const url = code
    ? `${BASE}/${playlistId}/songs?code=${encodeURIComponent(code)}`
    : `${BASE}/${playlistId}/songs`

  return request(url, {
    method: 'POST',
    body: JSON.stringify(song),
  })
}

export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string
): Promise<void> {
  await request(`${BASE}/${playlistId}/songs?songId=${songId}`, { method: 'DELETE' })
}
