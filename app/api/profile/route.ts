import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/profile — get the authenticated user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        banner: true,
        createdAt: true,
        _count: { select: { playlists: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ data: user })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH /api/profile — update basic profile info
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { username, avatar, banner } = body as { username?: string; avatar?: string; banner?: string }

    if (username) {
      const exists = await prisma.user.findFirst({
        where: { username, NOT: { id: session.user.id } },
      })
      if (exists) {
        return NextResponse.json({ error: 'Nome de usuário já em uso' }, { status: 409 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(username && { username }),
        ...(avatar && { avatar }),
        ...(banner !== undefined && { banner }),
      },
      select: { id: true, username: true, email: true, avatar: true, banner: true },
    })

    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
