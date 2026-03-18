import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type Params = { params: { id: string } }

const addSongSchema = z.object({
  youtubeVideoId: z.string().min(1),
  title: z.string().min(1),
  duration: z.number().int().min(0),
  thumbnail: z.string().url(),
  channel: z.string().min(1),
})

// POST /api/playlists/[id]/songs — add a song to a playlist
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
    const parsed = addSongSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { youtubeVideoId, title, duration, thumbnail, channel } = parsed.data

    // Upsert the song (another playlist may have already added it)
    const song = await prisma.song.upsert({
      where: { youtubeVideoId },
      update: duration > 0 ? { duration, title, thumbnail, channel } : {},
      create: { youtubeVideoId, title, duration, thumbnail, channel },
    })

    // Check duplicate
    const existing = await prisma.playlistSong.findUnique({
      where: { playlistId_songId: { playlistId: params.id, songId: song.id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Música já está na playlist' }, { status: 409 })
    }

    // Determine next order index
    const lastEntry = await prisma.playlistSong.findFirst({
      where: { playlistId: params.id },
      orderBy: { orderIndex: 'desc' },
    })
    const orderIndex = (lastEntry?.orderIndex ?? -1) + 1

    await prisma.playlistSong.create({
      data: { playlistId: params.id, songId: song.id, orderIndex },
    })

    return NextResponse.json({ data: song }, { status: 201 })
  } catch (error) {
    console.error('[playlists/:id/songs][POST] error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/playlists/[id]/songs?songId=xxx — remove a song from a playlist
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const songId = req.nextUrl.searchParams.get('songId')
    if (!songId) {
      return NextResponse.json({ error: 'songId ausente' }, { status: 400 })
    }

    const playlist = await prisma.playlist.findUnique({ where: { id: params.id } })
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist não encontrada' }, { status: 404 })
    }
    if (playlist.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await prisma.playlistSong.delete({
      where: { playlistId_songId: { playlistId: params.id, songId } },
    })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('[playlists/:id/songs][DELETE] error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
