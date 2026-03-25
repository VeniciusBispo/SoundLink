import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import YouTube from 'youtube-sr'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    let userSongs: any[] = []
    let analyzedArtist = ''
    let reason = 'Baseado em suas playlists'

    let updateUsage = null
    if (session) {
      // 1. Check Rate Limit
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (user) {
        const now = new Date()
        const lastReset = user.lastRadarResetAt ? new Date(user.lastRadarResetAt) : new Date(0)
        const diffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)

        let currentCount = user.radarUsageCount || 0
        let currentReset = lastReset

        if (diffHours >= 24) {
          currentCount = 0
          currentReset = now
        }

        if (currentCount >= 3) {
          console.log('[api/radar] Limit reached, returning cached results for user:', user.id)
          if (user.lastRadarResults) {
            try {
              const cached = JSON.parse(user.lastRadarResults)
              return NextResponse.json(cached)
            } catch (e) {
              console.error('[api/radar] Failed to parse cached results:', e)
            }
          }
          // If no cache yet but limit reached (unlikely but possible), 
          // we continue to one last search or return empty
        }

        // Prepare update for later
        updateUsage = {
          id: user.id,
          count: Math.min(currentCount + 1, 3), // Don't overflow if we keep returning cache
          reset: currentReset
        }
      }

      // Rest of the logic to get userSongs...

      // 2. Get all user's playlists (public and private)
      const playlists = await prisma.playlist.findMany({
        where: { ownerId: session.user.id },
        include: {
          songs: {
            include: {
              song: true
            }
          }
        }
      })

      userSongs = playlists.flatMap(p => p.songs.map(ps => ps.song))
    }

    // 2. Identify patterns if user has songs, else fallback to popular
    if (userSongs.length === 0) {
      const publicPlaylists = await prisma.playlist.findMany({
        where: { isPublic: true },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          songs: {
            include: {
              song: true
            }
          }
        }
      })
      userSongs = publicPlaylists.flatMap(p => p.songs.map(ps => ps.song))
      reason = 'Descubra sucessos da comunidade'
    }

    // Deduplicate and analyze
    const uniqueVideoIds = new Set(userSongs.map(s => s.youtubeVideoId))
    
    // Simple algorithm: pick a random song and use its artist or keyword
    // In a more complex system, we'd use a frequency map
    const randomSeedSong = userSongs.length > 0 
      ? userSongs[Math.floor(Math.random() * userSongs.length)]
      : null

    let searchQuery = 'musicas recomendadas 2024'
    
    if (randomSeedSong) {
      // Try to extract artist (assuming "Artist - Title" format or using channel name)
      const titleParts = randomSeedSong.title.split(/ [-–] /)
      const artist = titleParts.length > 1 ? titleParts[0] : (randomSeedSong.channel || '')
      
      if (artist && artist !== 'Unknown Channel') {
        analyzedArtist = artist
        searchQuery = `${artist} similar songs mix`
        reason = `Baseado em ${artist}`
      } else {
        searchQuery = `${randomSeedSong.title} similar music`
        reason = `Porque você ouviu ${randomSeedSong.title.slice(0, 20)}...`
      }
    }

    // 3. Search YouTube with robustness
    let searchData: any[] = []
    try {
      searchData = await YouTube.search(searchQuery, {
        limit: 20,
        type: 'video',
        safeSearch: true
      })
    } catch (err) {
      console.error('[api/radar] YouTube search error:', err)
      // Try a secondary, safer search if the first one crashed the library
      try {
        searchData = await YouTube.search('musicas populares 2024', { limit: 10, type: 'video' })
      } catch (innerErr) {
        console.error('[api/radar] Critical YouTube failure:', innerErr)
      }
    }

    // 4. Map and filter results
    const recommendations = searchData
      .filter(item => item && item.id && !uniqueVideoIds.has(item.id))
      .map(item => ({
        videoId: item.id,
        title: item.title,
        thumbnail: item.thumbnail?.url || '',
        channel: item.channel?.name || 'Unknown',
        duration: Math.floor((item.duration || 0) / 1000),
        reason
      }))
      .slice(0, 15)

    // 5. Update usage ONLY if we have results (don't penalize for system errors)
    if (updateUsage && recommendations.length > 0) {
      await prisma.user.update({
        where: { id: updateUsage.id },
        data: {
          radarUsageCount: updateUsage.count,
          lastRadarResetAt: updateUsage.reset,
          lastRadarResults: JSON.stringify(recommendations)
        }
      })
    } else if (updateUsage && recommendations.length === 0) {
      // If we failed to get recommendations, return a specific error but don't count the usage
      return NextResponse.json({ error: 'Não conseguimos encontrar recomendações agora. Tente de novo!' }, { status: 503 })
    }

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('[api/radar] error:', error)
    return NextResponse.json({ error: 'Falha ao gerar recomendações' }, { status: 500 })
  }
}
