import { NextResponse } from 'next/server'
import prismadb from '@/lib/prismadb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get('gameId')
    const songId = searchParams.get('songId')
    const session = await getServerSession(authOptions)

    if (!gameId || !songId) {
      return new NextResponse('Missing query params', { status: 400 })
    }

    // Global Top 10
    const globalTop = await prismadb.gameScore.findMany({
      where: { gameId, songId },
      orderBy: { score: 'desc' },
      take: 10,
      select: {
        username: true,
        score: true,
        createdAt: true,
      }
    })

    // User Personal Best
    let personalBest = null
    if (session?.user?.id) {
      personalBest = await prismadb.gameScore.findFirst({
        where: { gameId, songId, userId: session.user.id },
        orderBy: { score: 'desc' },
        select: { score: true }
      })
    }

    return NextResponse.json({
      global: globalTop,
      personalBest: personalBest?.score || 0
    })
  } catch (error) {
    console.error('[LEADERBOARD_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
