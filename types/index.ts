// ─── Domain Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string
  username: string
  email: string
  avatar?: string | null
  createdAt: Date
}

export interface Playlist {
  id: string
  name: string
  description?: string | null
  ownerId: string
  isPublic: boolean
  coverImage?: string | null
  createdAt: Date
  updatedAt: Date
  owner?: Pick<User, 'id' | 'username' | 'avatar'>
  songs?: PlaylistSong[]
  _count?: { songs: number }
}

export interface Song {
  id: string
  youtubeVideoId: string
  title: string
  duration: number // seconds
  thumbnail: string
  channel: string
}

export interface PlaylistSong {
  playlistId: string
  songId: string
  orderIndex: number
  addedAt: Date
  song: Song
}

// ─── Player Types ──────────────────────────────────────────────────────────────

export interface PlayerState {
  currentSong: Song | null
  queue: Song[]
  currentIndex: number
  isPlaying: boolean
  isShuffle: boolean
  volume: number
  isLoading: boolean
}

// ─── YouTube Types ─────────────────────────────────────────────────────────────

export interface YouTubeVideoInfo {
  videoId: string
  title: string
  duration: number
  thumbnail: string
  channel: string
}

// Minimal type for the YouTube IFrame Player
export interface YTPlayer {
  loadVideoById(videoId: string): void
  playVideo(): void
  pauseVideo(): void
  setVolume(volume: number): void
  getVolume(): number
  getPlayerState(): number
  seekTo(seconds: number, allowSeekAhead?: boolean): void
  getCurrentTime(): number
  getDuration(): number
  destroy(): void
}

export declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: YTPlayerOptions
      ) => YTPlayer
      PlayerState: {
        UNSTARTED: -1
        ENDED: 0
        PLAYING: 1
        PAUSED: 2
        BUFFERING: 3
        CUED: 5
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

export interface YTPlayerOptions {
  videoId?: string
  width?: number | string
  height?: number | string
  playerVars?: {
    autoplay?: 0 | 1
    controls?: 0 | 1
    rel?: 0 | 1
    modestbranding?: 0 | 1
    origin?: string
  }
  events?: {
    onReady?: (event: { target: YTPlayer }) => void
    onStateChange?: (event: { data: number; target: YTPlayer }) => void
    onError?: (event: { data: number; target: YTPlayer }) => void
  }
}

// ─── Offline Types ─────────────────────────────────────────────────────────────

export interface OfflinePlaylistRecord {
  playlistId: string
  playlist: Playlist
  songIds: string[]
  savedAt: string
}

export interface StorageEstimate {
  usage: number
  quota: number
}

// ─── API Response Types ─────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ─── Form Types ────────────────────────────────────────────────────────────────

export interface CreatePlaylistInput {
  name: string
  description?: string
  isPublic: boolean
}

export interface AddSongInput {
  youtubeUrl: string
}

export interface RegisterInput {
  username: string
  email: string
  password: string
}
