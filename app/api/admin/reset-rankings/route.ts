import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // @ts-ignore
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { gameId } = body

    if (gameId) {
      // Reset specific game rankings
      await prisma.gameScore.deleteMany({
        where: { gameId }
      })
      console.log(`[ADMIN] Reset rankings for game: ${gameId}`)
    } else {
      // Reset ALL rankings if no gameId provided
      await prisma.gameScore.deleteMany({})
      console.log(`[ADMIN] Reset ALL rankings`)
    }

    return new NextResponse('Rankings reset successfully', { status: 200 })
  } catch (error) {
    console.error('[ADMIN_RESET_RANKINGS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
