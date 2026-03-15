import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'

// GET /api/admin/users?page=1&q=search
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'))
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const take = 20
  const skip = (page - 1) * take

  const where = q
    ? {
        OR: [
          { username: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { playlists: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    data: users,
    meta: { total, page, pages: Math.ceil(total / take) },
  })
}
