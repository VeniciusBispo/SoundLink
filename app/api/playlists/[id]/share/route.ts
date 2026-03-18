import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

type Params = { params: { id: string } }

// POST /api/playlists/[id]/share — enable sharing, generate a code
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const playlist = await prisma.playlist.findUnique({ where: { id: params.id } })
    if (!playlist) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }
    if (playlist.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Reuse existing code if already generated, otherwise create a new one
    const shareCode = playlist.shareCode ?? randomBytes(4).toString('hex').toUpperCase()

    const updated = await prisma.playlist.update({
      where: { id: params.id },
      data: { shareCode, shareEnabled: true },
    })

    return NextResponse.json({ data: { shareCode: updated.shareCode } })
  } catch (error) {
    console.error('[playlists/:id/share][POST] error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/playlists/[id]/share — disable sharing (keeps code in DB but disables access)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const playlist = await prisma.playlist.findUnique({ where: { id: params.id } })
    if (!playlist) {
      return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    }
    if (playlist.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    await prisma.playlist.update({
      where: { id: params.id },
      data: { shareEnabled: false },
    })

    return NextResponse.json({ data: {} })
  } catch (error) {
    console.error('[playlists/:id/share][DELETE] error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
