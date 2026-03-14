'use client'

import { useState } from 'react'
import { fetchVideoInfo, isValidYouTubeUrl } from '@/services/youtubeService'
import type { YouTubeVideoInfo } from '@/types'

export function useYouTube() {
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookup = async (url: string): Promise<YouTubeVideoInfo | null> => {
    if (!isValidYouTubeUrl(url)) {
      setError('Invalid YouTube URL')
      return null
    }
    setError(null)
    setIsLoading(true)
    try {
      const info = await fetchVideoInfo(url)
      setVideoInfo(info)
      return info
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setVideoInfo(null)
    setError(null)
  }

  return { videoInfo, isLoading, error, lookup, reset }
}
