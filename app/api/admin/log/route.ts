import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Internal endpoint called from middleware to log page visits
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key')
  if (key !== (process.env.INTERNAL_API_KEY ?? 'soundlink-internal')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    await prisma.accessLog.create({
      data: {
        path: body.path ?? '/',
        method: 'GET',
        userId: body.userId ?? null,
        username: body.username ?? null,
        ip: body.ip ?? null,
        userAgent: body.userAgent ?? null,
      },
    })
  } catch {
    // silently ignore logging errors
  }

  return NextResponse.json({ ok: true })
}
