import { NextRequest, NextResponse } from 'next/server'
import { extractYouTubeId } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import YouTube from 'youtube-sr'

// GET /api/youtube?url=<youtubeUrl>  OR  /api/youtube?videoId=<id>
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const rawUrl = searchParams.get('url')
  const rawId = searchParams.get('videoId')

  const videoId = rawId ?? (rawUrl ? extractYouTubeId(rawUrl) : null)

  if (!videoId) {
    return NextResponse.json({ error: 'URL ou videoId inválido ou ausente' }, { status: 400 })
  }

  // 1. Check Database first (Zero Quota, Instant)
  try {
    const cachedSong = await prisma.song.findUnique({
      where: { youtubeVideoId: videoId }
    })
    if (cachedSong && cachedSong.duration > 0) {
      return NextResponse.json({
        videoId: cachedSong.youtubeVideoId,
        title: cachedSong.title,
        channel: cachedSong.channel,
        thumbnail: cachedSong.thumbnail,
        duration: cachedSong.duration,
      })
    }
  } catch (dbError) {
    console.warn('[youtube][DB] cache check failed:', dbError)
  }

  // 2. Fetch using Scraper (Zero Quota)
  try {
    const video = await YouTube.getVideo(`https://www.youtube.com/watch?v=${videoId}`)
    if (video) {
        const result = {
            videoId: video.id as string,
            title: video.title as string,
            channel: video.channel?.name || 'Unknown Channel',
            thumbnail: video.thumbnail?.url || '',
            duration: Math.floor((video.duration || 0) / 1000)
        }

        // Persist to DB for future requests
        if (result.duration > 0) {
          await prisma.song.upsert({
            where: { youtubeVideoId: videoId },
            update: { 
                title: result.title,
                duration: result.duration,
                thumbnail: result.thumbnail,
                channel: result.channel
            },
            create: {
                youtubeVideoId: videoId,
                title: result.title,
                duration: result.duration,
                thumbnail: result.thumbnail,
                channel: result.channel
            }
          }).catch(err => console.warn('[youtube][upsert] failed:', err))
        }

        return NextResponse.json(result)
    }
  } catch (srError) {
    console.warn('[youtube][sr] fetch failed, falling back to oEmbed:', srError)
  }

  // 3. Fallback: oEmbed + Watch page scraping (Zero Quota)
  try {
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

    if (oEmbedRes.ok) {
      const oe = await oEmbedRes.json()
      let duration = 0
      if (watchPageRes.ok) {
        const html = await watchPageRes.text()
        const match = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/)
        if (match) duration = parseInt(match[1], 10)
      }

      const result = {
        videoId,
        title: oe.title as string,
        channel: oe.author_name as string,
        thumbnail: oe.thumbnail_url as string,
        duration,
      }

      // Persist fallback result
      if (duration > 0) {
        await prisma.song.upsert({
          where: { youtubeVideoId: videoId },
          update: { duration },
          create: {
            youtubeVideoId: videoId,
            title: result.title,
            duration: result.duration,
            thumbnail: result.thumbnail,
            channel: result.channel
          }
        }).catch(() => {})
      }

      return NextResponse.json(result)
    }
  } catch (fallbackError) {
    console.error('[youtube][fallback] error:', fallbackError)
  }

  return NextResponse.json({ error: 'Vídeo não encontrado ou indisponível' }, { status: 404 })
}
