import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type Params = { params: { id: string } }

const songSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  thumbnail: z.string(),
  channel: z.string(),
  duration: z.number().int().min(0),
})

const importSchema = z.object({
  songs: z.array(songSchema).min(1).max(150),
})

// POST /api/playlists/[id]/import — bulk import selected songs
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const playlist = await prisma.playlist.findUnique({ where: { id: params.id } })
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }
    if (playlist.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = importSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    // Determine starting orderIndex
    const lastEntry = await prisma.playlistSong.findFirst({
      where: { playlistId: params.id },
      orderBy: { orderIndex: 'desc' },
    })
    let orderIndex = (lastEntry?.orderIndex ?? -1) + 1

    let imported = 0
    let skipped = 0

    for (const s of parsed.data.songs) {
      const song = await prisma.song.upsert({
        where: { youtubeVideoId: s.videoId },
        update: s.duration > 0 ? { duration: s.duration, title: s.title, thumbnail: s.thumbnail, channel: s.channel } : {},
        create: {
          youtubeVideoId: s.videoId,
          title: s.title,
          duration: s.duration,
          thumbnail: s.thumbnail,
          channel: s.channel,
        },
      })

      const existing = await prisma.playlistSong.findUnique({
        where: { playlistId_songId: { playlistId: params.id, songId: song.id } },
      })

      if (existing) {
        skipped++
      } else {
        await prisma.playlistSong.create({
          data: { playlistId: params.id, songId: song.id, orderIndex },
        })
        imported++
        orderIndex++
      }
    }

    return NextResponse.json({ imported, skipped })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
