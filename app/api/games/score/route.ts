import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { gameId, songId, score } = body

    if (!gameId || !songId || score === undefined) {
      return new NextResponse('Missing fields', { status: 400 })
    }

    // Save score
    const gameScore = await prisma.gameScore.create({
      data: {
        gameId,
        songId,
        score: parseInt(score),
        userId: session?.user?.id,
        username: session?.user?.name || session?.user?.username || 'Anônimo',
      }
    })

    return NextResponse.json(gameScore)
  } catch (error) {
    console.error('[GAMES_SCORE_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
