import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/songs?page=1 — all songs that appear in at least one public playlist
export async function GET(req: NextRequest) {
  try {
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'))
    const take = 50
    const skip = (page - 1) * take

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where: {
          playlists: {
            some: {
              playlist: { isPublic: true },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.song.count({
        where: {
          playlists: {
            some: {
              playlist: { isPublic: true },
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      data: songs,
      meta: { total, page, pages: Math.ceil(total / take) },
    })
  } catch (error) {
    console.error('[songs][GET] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
