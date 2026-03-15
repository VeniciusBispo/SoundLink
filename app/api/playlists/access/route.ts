import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/playlists/access?code=XXXXXXXX
// Resolves a share code to a playlist ID so the client can redirect properly.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim()

  if (!code || code.length < 4) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  }

  const playlist = await prisma.playlist.findFirst({
    where: { shareCode: code, shareEnabled: true },
    select: { id: true },
  })

  if (!playlist) {
    return NextResponse.json({ error: 'Código não encontrado ou expirado' }, { status: 404 })
  }

  return NextResponse.json({ playlistId: playlist.id })
}
