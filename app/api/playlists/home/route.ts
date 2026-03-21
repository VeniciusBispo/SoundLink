import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const [myPlaylists, recentPublic, topByCount] = await Promise.all([
      userId
        ? prisma.playlist.findMany({
            where: { ownerId: userId },
            include: {
              owner: { select: { id: true, username: true, avatar: true } },
              _count: { select: { songs: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 12,
          })
        : [],
      prisma.playlist.findMany({
        where: { isPublic: true },
        include: {
          owner: { select: { id: true, username: true, avatar: true } },
          _count: { select: { songs: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      prisma.playlist.findMany({
        where: { isPublic: true },
        include: {
          owner: { select: { id: true, username: true, avatar: true } },
          _count: { select: { songs: true } },
        },
        orderBy: { songs: { _count: 'desc' } },
        take: 12,
      }),
    ])

    return NextResponse.json({
      myPlaylists,
      recentPublic,
      topByCount,
    })
  } catch (error) {
    console.error('[playlists/home][GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
