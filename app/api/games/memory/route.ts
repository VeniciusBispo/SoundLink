import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 1. Get user songs
    const userPlaylists = await prisma.playlist.findMany({
      where: { ownerId: session.user.id },
      include: { songs: { include: { song: true } } }
    })

    let candidateSongs = userPlaylists.flatMap(p => p.songs.map(ps => ps.song))

    // Fallback if user has no songs
    if (candidateSongs.length < 8) {
      const publicSongs = await prisma.song.findMany({ take: 50 })
      candidateSongs = [...candidateSongs, ...publicSongs]
    }

    // Shuffle and pick 8 unique songs to create 16 cards (8 pairs)
    const shuffled = [...candidateSongs].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 8)

    // Create pairs: each song produces two cards
    // One card with Title, another with Artist (or Image)
    const cards = selected.flatMap((song, index) => [
      {
        id: `card-${index}-a`,
        pairId: song.id,
        type: 'title',
        content: song.title,
        secondary: song.channel,
        image: song.thumbnail
      },
      {
        id: `card-${index}-b`,
        pairId: song.id,
        type: 'artist',
        content: song.channel,
        secondary: song.title,
        image: song.thumbnail
      }
    ])

    // Shuffle the 16 cards
    const finalCards = cards.sort(() => 0.5 - Math.random())

    return NextResponse.json(finalCards)
  } catch (error) {
    console.error('[API_MEMORY_GET]', error)
    return NextResponse.json({ error: 'Falha ao gerar o jogo' }, { status: 500 })
  }
}
