import { NextRequest, NextResponse } from 'next/server'
import YouTube from 'youtube-sr'

// GET /api/youtube/playlist?url=<youtubePlaylistUrl>
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Parâmetro url ausente' }, { status: 400 })
  }

  try {
    let targetUrl = url
    
    // Normalize URL: Extract 'list' ID if it's a standard watch or playlist URL
    if (url.includes('list=')) {
      try {
        const urlObj = new URL(url)
        const listId = urlObj.searchParams.get('list')
        if (listId) {
          targetUrl = `https://www.youtube.com/playlist?list=${listId}`
        }
      } catch (e) {
        // Fallback to original URL if parsing fails
      }
    }

    console.log('[youtube][playlist] Fetching:', targetUrl)

    // Fetch playlist using youtube-sr (no API Key needed)
    let playlist
    try {
      playlist = await YouTube.getPlaylist(targetUrl, { fetchAll: true })
    } catch (e: any) {
      console.error('[youtube][playlist] getPlaylist exception:', e.message)
      // If it's a "Mix" (RD...), youtube-sr often fails
      if (targetUrl.includes('list=RD')) {
        return NextResponse.json({ 
          error: 'Links de "Mix" do YouTube não podem ser importados. Tente uma playlist comum.' 
        }, { status: 400 })
      }
      throw e
    }
    
    if (!playlist || (!playlist.title && (!playlist.videos || playlist.videos.length === 0))) {
      console.error('[youtube][playlist] Playlist not found or empty:', targetUrl)
      
      const isMix = targetUrl.includes('list=RD') || targetUrl.includes('list=UL')
      const errorMessage = isMix 
        ? 'Playlists do tipo "Mix" ou "Uploads" não são suportadas. Use uma playlist pública criada por um usuário.'
        : 'Playlist não encontrada ou está privada. Verifique se ela é pública.'

      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    const items = (playlist.videos ?? []).map((video) => ({
      videoId: video.id,
      title: video.title,
      channel: video.channel?.name || 'Canal Desconhecido',
      thumbnail: video.thumbnail?.url || '',
      duration: Math.floor((video.duration || 0) / 1000)
    }))

    console.log(`[youtube][playlist] Success: ${items.length} videos found in "${playlist.title}"`)

    return NextResponse.json({ 
      playlistTitle: playlist.title || 'YouTube Playlist', 
      items 
    })
  } catch (error: any) {
    console.error('[youtube][playlist] Critical error:', error)
    return NextResponse.json({ 
      error: `Erro ao buscar playlist: ${error.message || 'Verifique se ela é pública'}` 
    }, { status: 500 })
  }
}
