import { NextRequest, NextResponse } from 'next/server'

// ISO 8601 duration to seconds
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return (Number(match[1] ?? 0) * 3600) + (Number(match[2] ?? 0) * 60) + Number(match[3] ?? 0)
}

function extractPlaylistId(raw: string): string | null {
  try {
    const parsed = new URL(raw)
    return parsed.searchParams.get('list')
  } catch {
    const m = raw.match(/[?&]list=([^&]+)/)
    return m ? m[1] : null
  }
}

// GET /api/youtube/playlist?url=<youtubePlaylistUrl>
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Parâmetro url ausente' }, { status: 400 })
  }

  const playlistId = extractPlaylistId(url)
  if (!playlistId) {
    return NextResponse.json(
      { error: 'URL inválida: não foi possível encontrar o ID da playlist' },
      { status: 400 }
    )
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey || apiKey === 'your-youtube-api-key') {
    return NextResponse.json({ error: 'YouTube API não configurada no servidor' }, { status: 503 })
  }

  // Fetch playlist items — paginate up to 3 pages (max 150 songs)
  interface RawItem { videoId: string; title: string; thumbnail: string; channel: string; duration: number }
  const items: RawItem[] = []
  let pageToken: string | undefined
  const MAX_PAGES = 3

  for (let page = 0; page < MAX_PAGES; page++) {
    const qp = new URLSearchParams({ part: 'snippet', playlistId, maxResults: '50', key: apiKey })
    if (pageToken) qp.set('pageToken', pageToken)

    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${qp}`)
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      const msg =
        errData?.error?.errors?.[0]?.reason ??
        errData?.error?.message ??
        'Erro ao buscar playlist do YouTube'
      return NextResponse.json({ error: msg }, { status: res.status })
    }

    const data = await res.json()
    for (const item of data.items ?? []) {
      const s = item.snippet
      const videoId: string = s?.resourceId?.videoId
      if (!videoId) continue
      // Skip deleted / private
      if (s.title === 'Deleted video' || s.title === 'Private video') continue

      const thumbs = s.thumbnails ?? {}
      const thumbnail: string =
        thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ?? ''

      items.push({
        videoId,
        title: s.title ?? '',
        thumbnail,
        channel: s.videoOwnerChannelTitle ?? '',
        duration: 0,
      })
    }

    pageToken = data.nextPageToken
    if (!pageToken) break
  }

  if (items.length === 0) {
    return NextResponse.json({ playlistTitle: '', items: [] })
  }

  // Batch-fetch durations (50 at a time)
  const durationMap = new Map<string, number>()
  const videoIds = items.map((i) => i.videoId)
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const qp = new URLSearchParams({ part: 'contentDetails', id: batch.join(','), key: apiKey })
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${qp}`)
    if (res.ok) {
      const data = await res.json()
      for (const v of data.items ?? []) {
        durationMap.set(v.id as string, parseDuration(v.contentDetails.duration as string))
      }
    }
  }
  for (const item of items) {
    item.duration = durationMap.get(item.videoId) ?? 0
  }

  // Fetch playlist title
  let playlistTitle = ''
  const titleRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(apiKey)}`
  )
  if (titleRes.ok) {
    const titleData = await titleRes.json()
    playlistTitle = (titleData.items?.[0]?.snippet?.title as string) ?? ''
  }

  return NextResponse.json({ playlistTitle, items })
}
