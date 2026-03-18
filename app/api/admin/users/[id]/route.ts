import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'

type Params = { params: { id: string } }

// DELETE /api/admin/users/[id] — delete a user and their data
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, error } = await requireAdmin()
  if (error) return error

  if (params.id === session!.user.id) {
    return NextResponse.json({ error: 'Não é possível excluir a própria conta' }, { status: 400 })
  }

  try {
    // MongoDB: relation cascades are not guaranteed. Manually delete everything related.
    const userId = params.id

    const playlists = await prisma.playlist.findMany({
      where: { ownerId: userId },
      select: { id: true },
    })
    const playlistIds = playlists.map((p) => p.id)

    // Best-effort cleanup of relational data
    if (playlistIds.length) {
      await prisma.playlistSong.deleteMany({
        where: { playlistId: { in: playlistIds } },
      })
      await prisma.playlist.deleteMany({
        where: { id: { in: playlistIds } },
      })
    }

    await prisma.account.deleteMany({ where: { userId } })
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.accessLog.deleteMany({ where: { userId } })

    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('[admin/users/:id][DELETE] error:', error)
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }
}

// PATCH /api/admin/users/[id] — update role
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { role } = await req.json()
  if (!['USER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, username: true, role: true },
  })

  return NextResponse.json({ data: user })
}
