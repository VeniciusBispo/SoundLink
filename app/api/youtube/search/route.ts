import { NextRequest, NextResponse } from 'next/server'

// ISO 8601 duration to seconds (e.g. PT4M13S → 253)
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return (Number(match[1] ?? 0) * 3600) + (Number(match[2] ?? 0) * 60) + Number(match[3] ?? 0)
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ error: 'Parâmetro de busca ausente' }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey || apiKey === 'your-youtube-api-key') {
    return NextResponse.json({ error: 'API key do YouTube não configurada' }, { status: 500 })
  }

  try {
    // 1. Search for videos
    const searchEndpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(q)}&type=video&key=${encodeURIComponent(apiKey)}`
    const searchRes = await fetch(searchEndpoint, { next: { revalidate: 3600 } })
    
    if (!searchRes.ok) {
        throw new Error('Falha ao buscar no YouTube')
    }
    
    const searchData = await searchRes.json()
    
    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ results: [] })
    }

    // 2. Fetch durations for the videos found
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')
    const detailsEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${encodeURIComponent(apiKey)}`
    const detailsRes = await fetch(detailsEndpoint, { next: { revalidate: 3600 } })
    
    const durationMap = new Map<string, number>()
    if (detailsRes.ok) {
      const detailsData = await detailsRes.json()
      detailsData.items?.forEach((item: any) => {
        durationMap.set(item.id, parseDuration(item.contentDetails?.duration || ''))
      })
    }
    
    // 3. Map into the final result shape matching videoInfo
    const results = searchData.items.map((item: any) => {
        const thumbnails = item.snippet.thumbnails
        const thumbnail =
          thumbnails.maxres?.url ??
          thumbnails.high?.url ??
          thumbnails.medium?.url ??
          thumbnails.default?.url ??
          ''
        
        return {
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail,
            duration: durationMap.get(item.id.videoId) || 0
        }
    })
    
    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
