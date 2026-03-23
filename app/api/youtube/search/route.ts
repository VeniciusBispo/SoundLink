import { NextRequest, NextResponse } from 'next/server'
import YouTube from 'youtube-sr'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ error: 'Parâmetro de busca ausente' }, { status: 400 })
  }

  try {
    // Search using youtube-sr (no API Key needed, 0 quota units)
    const searchData = await YouTube.search(q, {
      limit: 15,
      type: 'video',
      safeSearch: true
    })

    if (!searchData || searchData.length === 0) {
      return NextResponse.json({ results: [] })
    }

    const results = searchData.map((item) => {
        // Map to the final result shape expected by the frontend
        return {
            videoId: item.id,
            title: item.title,
            channel: item.channel?.name || 'Unknown Channel',
            thumbnail: item.thumbnail?.url || '',
            duration: Math.floor((item.duration || 0) / 1000) // ms to seconds
        }
    })
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('[youtube][search] error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
