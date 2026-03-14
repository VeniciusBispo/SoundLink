import type { YouTubeVideoInfo } from '@/types'
import { extractYouTubeId } from '@/lib/utils'

export { extractYouTubeId }

/**
 * Fetch video metadata from the backend YouTube proxy.
 * Throws an Error if the request fails.
 */
export async function fetchVideoInfo(youtubeUrl: string): Promise<YouTubeVideoInfo> {
  const videoId = extractYouTubeId(youtubeUrl)
  if (!videoId) throw new Error('Invalid YouTube URL')

  const res = await fetch(`/api/youtube?videoId=${encodeURIComponent(videoId)}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to fetch video info')
  }
  return res.json() as Promise<YouTubeVideoInfo>
}

/**
 * Check if a string looks like any valid YouTube URL.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

/**
 * Load the YouTube IFrame API script once and fire the callback when ready.
 * Safe to call multiple times.
 */
export function loadYouTubeAPI(onReady: () => void): void {
  if (typeof window === 'undefined') return

  if (window.YT?.Player) {
    onReady()
    return
  }

  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'

  const existing = window.onYouTubeIframeAPIReady
  window.onYouTubeIframeAPIReady = () => {
    existing?.()
    onReady()
  }

  document.head.appendChild(tag)
}
