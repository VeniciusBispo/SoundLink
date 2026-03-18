import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  isPublic: z.boolean().default(true),
  coverImage: z.string().max(2_000_000).optional(), // URL or data URL
})

// GET /api/playlists — list public playlists or user's own playlists
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = req.nextUrl
    const mine = searchParams.get('mine') === 'true'
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)))
    const skip = (page - 1) * pageSize

    const sortBy = searchParams.get('sortBy') // 'recent' | 'songs'

    const where = mine && session
      ? { ownerId: session.user.id }
      : { isPublic: true }

    const orderBy = sortBy === 'songs'
      ? { songs: { _count: 'desc' as const } }
      : { createdAt: 'desc' as const }

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where,
        include: {
          owner: { select: { id: true, username: true, avatar: true } },
          _count: { select: { songs: true } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.playlist.count({ where }),
    ])

    return NextResponse.json({ data: playlists, total, page, pageSize })
  } catch (error) {
    console.error('[playlists][GET] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/playlists — create a new playlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createPlaylistSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const playlist = await prisma.playlist.create({
      data: {
        ...parsed.data,
        ownerId: session.user.id,
      },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        _count: { select: { songs: true } },
      },
    })

    return NextResponse.json({ data: playlist }, { status: 201 })
  } catch (error) {
    console.error('[playlists][POST] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
