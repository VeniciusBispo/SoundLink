import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'

// GET /api/admin/feedback?page=1
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

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

// DELETE /api/admin/feedback?id=xxx — delete a message
export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.feedback.delete({ where: { id } }).catch(() => {})
  return NextResponse.json({ data: { success: true } })
}
