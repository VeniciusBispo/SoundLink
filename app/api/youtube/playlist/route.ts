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
    let playlist: any;
    try {
      playlist = await YouTube.getPlaylist(targetUrl, { fetchAll: true });
    } catch (e: any) {
      console.error('[youtube][playlist] getPlaylist exception, trying manual fallback:', e.message);
      
      try {
        playlist = await fetchManualPlaylist(targetUrl);
      } catch (fallbackError: any) {
        console.error('[youtube][playlist] Manual fallback also failed:', fallbackError.message);
        
        // If it's a "Mix" (RD...), youtube-sr often fails
        if (targetUrl.includes('list=RD')) {
          return NextResponse.json({ 
            error: 'Links de "Mix" do YouTube não podem ser importados. Tente uma playlist comum.' 
          }, { status: 400 });
        }
        throw e; // Throw the original youtube-sr error if fallback fails
      }
    }
    
    if (!playlist || (!playlist.title && (!playlist.videos || playlist.videos.length === 0))) {
      console.error('[youtube][playlist] Playlist not found or empty:', targetUrl);
      
      const isMix = targetUrl.includes('list=RD') || targetUrl.includes('list=UL');
      const errorMessage = isMix 
        ? 'Playlists do tipo "Mix" ou "Uploads" não são suportadas. Use uma playlist pública criada por um usuário.'
        : 'Playlist não encontrada ou está privada. Verifique se ela é pública.';

      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    const items = (playlist.videos ?? []).map((video: any) => ({
      videoId: video.id || video.videoId,
      title: video.title,
      channel: video.channel?.name || video.author || 'Canal Desconhecido',
      thumbnail: video.thumbnail?.url || video.thumbnail || '',
      duration: Math.floor((video.duration || 0) / 1000) || video.durationSeconds || 0
    }));

    console.log(`[youtube][playlist] Success: ${items.length} videos found in "${playlist.title}"`);

    return NextResponse.json({ 
      playlistTitle: playlist.title || 'YouTube Playlist', 
      items 
    });
  } catch (error: any) {
    console.error('[youtube][playlist] Critical error:', error);
    return NextResponse.json({ 
      error: `Erro ao buscar playlist: ${error.message || 'Verifique se ela é pública'}` 
    }, { status: 500 });
  }
}

// Recursive helper to find the first instance of a key
function findRenderer(obj: any, key: string): any {
    if (!obj || typeof obj !== 'object') return null;
    if (obj[key]) return obj[key];
    for (const k in obj) {
        const result = findRenderer(obj[k], key);
        if (result) return result;
    }
    return null;
}

async function fetchManualPlaylist(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error(`YouTube returned status ${response.status}`);
    
    const html = await response.text();
    const startPattern = 'var ytInitialData = ';
    const endPattern = ';</script>';
    const startIndex = html.indexOf(startPattern);
    
    if (startIndex === -1) {
        // Try alternative pattern if not found
        if (html.includes('PLAYER_VARS')) {
            throw new Error('Detected YouTube Player page instead of Playlist page. Verify the link.');
        }
        throw new Error('Could not find playlist data on page');
    }
    
    const jsonStart = startIndex + startPattern.length;
    const jsonEnd = html.indexOf(endPattern, jsonStart);
    const jsonStr = html.substring(jsonStart, jsonEnd);
    const data = JSON.parse(jsonStr);

    const playlistRenderer = findRenderer(data, 'playlistVideoListRenderer');
    if (!playlistRenderer || !playlistRenderer.contents) {
        throw new Error('Playlist contents not found in YouTube data structure');
    }

    const videos = playlistRenderer.contents.map((item: any) => {
        const v = item.playlistVideoRenderer;
        if (!v) return null;
        return {
            videoId: v.videoId,
            title: v.title?.runs?.[0]?.text || 'Sem título',
            author: v.shortBylineText?.runs?.[0]?.text || 'Desconhecido',
            thumbnail: v.thumbnail?.thumbnails?.[0]?.url || '',
            durationSeconds: parseDuration(v.lengthText?.simpleText)
        };
    }).filter(Boolean);

    const title = data.metadata?.playlistMetadataRenderer?.title || 
                  findRenderer(data, 'microformatDataRenderer')?.title ||
                  'YouTube Playlist';

    return {
        title,
        videos
    };
  } catch (error: any) {
    console.error('[fetchManualPlaylist] Error:', error.message);
    throw error;
  }
}

function parseDuration(text?: string) {
    if (!text) return 0;
    const parts = text.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
}
