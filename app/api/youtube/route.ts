import { NextRequest, NextResponse } from 'next/server'
import { extractYouTubeId } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

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

  // If YouTube Data API returned a valid duration, persist to DB
  if (apiKey && apiKey !== 'your-youtube-api-key') {
    const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(apiKey)}`
    const ytRes = await fetch(endpoint, { next: { revalidate: 3600 } })
    if (ytRes.ok) {
      const ytData = await ytRes.json()
      const item = ytData.items?.[0]
      if (item) {
        const thumbnails = item.snippet.thumbnails
        const thumbnail =
          thumbnails.maxres?.url ??
          thumbnails.high?.url ??
          thumbnails.medium?.url ??
          thumbnails.default?.url ??
          ''
        const dur = parseDuration(item.contentDetails.duration as string)
        if (dur > 0) {
          await prisma.song.updateMany({
            where: { youtubeVideoId: videoId, duration: 0 },
            data: { duration: dur },
          }).catch(() => {})
        }
        return NextResponse.json({
          videoId,
          title: item.snippet.title as string,
          channel: item.snippet.channelTitle as string,
          thumbnail,
          duration: dur,
        })
      }
    }
  }

  // Fallback: oEmbed gives title/channel/thumbnail; fetch watch page for duration
  const [oEmbedRes, watchPageRes] = await Promise.all([
    fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`,
      { next: { revalidate: 3600 } }
    ),
    fetch(
      `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      {
        headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 3600 },
      }
    ),
  ])

  if (!oEmbedRes.ok) {
    return NextResponse.json({ error: 'Video not found or unavailable' }, { status: 404 })
  }

  const oe = await oEmbedRes.json()

  // Extract duration (seconds) from the embedded JSON in the watch page
  let duration = 0
  if (watchPageRes.ok) {
    const html = await watchPageRes.text()
    // "lengthSeconds":"225" appears in the ytInitialPlayerResponse JSON blob
    const match = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/)
    if (match) duration = parseInt(match[1], 10)
  }

  // Persist resolved duration to DB so next view loads correctly
  if (duration > 0) {
    await prisma.song.updateMany({
      where: { youtubeVideoId: videoId, duration: 0 },
      data: { duration },
    }).catch(() => {})
  }

  return NextResponse.json({
    videoId,
    title: oe.title as string,
    channel: oe.author_name as string,
    thumbnail: oe.thumbnail_url as string,
    duration,
  })
}
