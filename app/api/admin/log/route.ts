import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Internal endpoint called from middleware to log page visits
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key')
  if (key !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    await prisma.accessLog.create({
      data: {
        path: body.path ?? '/',
        method: body.method ?? 'GET',
        status: body.status ?? null,
        responseTime: body.responseTime ?? null,
        userId: body.userId ?? null,
        username: body.username ?? null,
        ip: body.ip ?? null,
        userAgent: body.userAgent ?? null,
      } as any,
    })
  } catch (error) {
    console.warn('[admin/log][POST] accessLog failed:', error)
  }

  return NextResponse.json({ ok: true })
}
