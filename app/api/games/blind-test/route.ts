import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import YouTube from 'youtube-sr'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 1. Get user songs to build a personalized test
    const userPlaylists = await prisma.playlist.findMany({
      where: { ownerId: session.user.id },
      include: { songs: { include: { song: true } } }
    })

    let candidateSongs = userPlaylists.flatMap(p => p.songs.map(ps => ps.song))

    // Fallback if user has no songs: get some from public playlists
    if (candidateSongs.length < 5) {
      const publicSongs = await prisma.song.findMany({ take: 50 })
      candidateSongs = [...candidateSongs, ...publicSongs]
    }

    // Shuffle and pick 10 unique songs for correct answers
    const shuffled = [...candidateSongs].sort(() => 0.5 - Math.random())
    const selectedCorrect = shuffled.slice(0, 10)

    const questions = selectedCorrect.map(correct => {
      // Pick 3 distractors (wrong options)
      const distractors = candidateSongs
        .filter(s => s.id !== correct.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)

      const options = [correct, ...distractors]
        .sort(() => 0.5 - Math.random())
        .map(s => ({
          id: s.id,
          title: s.title,
          channel: s.channel,
          youtubeVideoId: s.youtubeVideoId
        }))

      // Random start time (avoiding the very beginning and very end)
      // Usually songs are 3-4 mins (180-240s). Let's pick between 30s and duration-30s.
      const duration = correct.duration || 200
      const startTime = Math.floor(Math.random() * Math.max(10, duration - 40)) + 20

      return {
        correctId: correct.id,
        youtubeVideoId: correct.youtubeVideoId,
        startTime,
        options
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('[API_BLIND_TEST_GET]', error)
    return NextResponse.json({ error: 'Falha ao gerar o jogo' }, { status: 500 })
  }
}
