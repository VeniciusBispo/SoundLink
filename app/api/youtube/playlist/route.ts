import { NextRequest, NextResponse } from 'next/server'
import YouTube from 'youtube-sr'

// GET /api/youtube/playlist?url=<youtubePlaylistUrl>
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Parâmetro url ausente' }, { status: 400 })
  }

  try {
    // Fetch playlist using youtube-sr (no API Key needed)
    const playlist = await YouTube.getPlaylist(url, { fetchAll: true })
    
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist não encontrada' }, { status: 404 })
    }

    const items = (playlist.videos ?? []).map((video) => ({
      videoId: video.id,
      title: video.title,
      channel: video.channel?.name || 'Unknown Channel',
      thumbnail: video.thumbnail?.url || '',
      duration: Math.floor((video.duration || 0) / 1000)
    }))

    return NextResponse.json({ 
      playlistTitle: playlist.title || 'YouTube Playlist', 
      items 
    })
  } catch (error) {
    console.error('[youtube][playlist] error:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar playlist do YouTube (Verifique se ela é pública)' 
    }, { status: 500 })
  }
}
