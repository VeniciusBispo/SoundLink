import { NextRequest, NextResponse } from 'next/server'
import { extractYouTubeId } from '@/lib/utils'

// ISO 8601 duration to seconds (e.g. PT4M13S → 253)
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return (Number(match[1] ?? 0) * 3600) + (Number(match[2] ?? 0) * 60) + Number(match[3] ?? 0)
}

// GET /api/youtube?url=<youtubeUrl>  OR  /api/youtube?videoId=<id>
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const rawUrl = searchParams.get('url')
  const rawId = searchParams.get('videoId')

  const videoId = rawId ?? (rawUrl ? extractYouTubeId(rawUrl) : null)

  if (!videoId) {
    return NextResponse.json({ error: 'Invalid or missing YouTube URL / videoId' }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
  }

  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`

  const ytRes = await fetch(endpoint, { next: { revalidate: 3600 } })
  if (!ytRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch video from YouTube' }, { status: 502 })
  }

  const ytData = await ytRes.json()
  const item = ytData.items?.[0]
  if (!item) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const thumbnails = item.snippet.thumbnails
  const thumbnail =
    thumbnails.maxres?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    ''

  return NextResponse.json({
    videoId,
    title: item.snippet.title as string,
    channel: item.snippet.channelTitle as string,
    thumbnail,
    duration: parseDuration(item.contentDetails.duration as string),
  })
}
