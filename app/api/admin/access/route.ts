import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'

// GET /api/admin/access?page=1&path=&user=
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'))
  const pathFilter = req.nextUrl.searchParams.get('path') ?? ''
  const userFilter = req.nextUrl.searchParams.get('user') ?? ''
  const take = 50
  const skip = (page - 1) * take

  const where: Record<string, unknown> = {}
  if (pathFilter) where.path = { contains: pathFilter }
  if (userFilter) where.username = { contains: userFilter }

  const [logs, total] = await Promise.all([
    prisma.accessLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.accessLog.count({ where }),
  ])

  return NextResponse.json({
    data: logs,
    meta: { total, page, pages: Math.ceil(total / take) },
  })
}
