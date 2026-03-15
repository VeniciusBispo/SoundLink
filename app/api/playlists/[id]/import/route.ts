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
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const playlist = await prisma.playlist.findUnique({ where: { id: params.id } })
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist não encontrada' }, { status: 404 })
    }
    if (playlist.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = importSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    // 1. Upsert all songs in parallel batches of 20
    const CHUNK = 20
    const upsertedSongs: { id: string }[] = []
    for (let i = 0; i < parsed.data.songs.length; i += CHUNK) {
      const batch = parsed.data.songs.slice(i, i + CHUNK)
      const results = await Promise.all(
        batch.map((s) =>
          prisma.song.upsert({
            where: { youtubeVideoId: s.videoId },
            update: s.duration > 0 ? { duration: s.duration, title: s.title, thumbnail: s.thumbnail, channel: s.channel } : {},
            create: { youtubeVideoId: s.videoId, title: s.title, duration: s.duration, thumbnail: s.thumbnail, channel: s.channel },
            select: { id: true },
          })
        )
      )
      upsertedSongs.push(...results)
    }

    // 2. Bulk-fetch all existing playlist-song relationships in one query
    const existingEntries = await prisma.playlistSong.findMany({
      where: { playlistId: params.id },
      select: { songId: true },
    })
    const existingIds = new Set(existingEntries.map((e) => e.songId))

    // 3. Determine starting orderIndex
    const lastEntry = await prisma.playlistSong.findFirst({
      where: { playlistId: params.id },
      orderBy: { orderIndex: 'desc' },
    })
    let orderIndex = (lastEntry?.orderIndex ?? -1) + 1

    // 4. Create new playlist-song entries in parallel batches of 20
    const newSongs = upsertedSongs.filter((s) => !existingIds.has(s.id))
    const skipped = upsertedSongs.length - newSongs.length

    for (let i = 0; i < newSongs.length; i += CHUNK) {
      const batch = newSongs.slice(i, i + CHUNK)
      await Promise.all(
        batch.map((song, j) =>
          prisma.playlistSong.create({
            data: { playlistId: params.id, songId: song.id, orderIndex: orderIndex + i + j },
          })
        )
      )
    }

    return NextResponse.json({ imported: newSongs.length, skipped })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
