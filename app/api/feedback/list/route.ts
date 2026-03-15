import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/feedback — list all feedback (requires login)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'))
  const take = 20
  const skip = (page - 1) * take

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.feedback.count(),
  ])

  return NextResponse.json({
    data: items,
    meta: { total, page, pages: Math.ceil(total / take) },
  })
}
