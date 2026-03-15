import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Protect all /admin/* routes — must be ADMIN role
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }
  }

  const response = NextResponse.next()

  // Log page visits (skip API, static, and Next internals)
  const { pathname } = req.nextUrl
  const skip =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/manifest') ||
    pathname.includes('.')

  if (!skip) {
    // Fire-and-forget — don't block the request
    const logPayload = {
      path: pathname,
      userId: (token?.id as string) ?? null,
      username: (token?.username as string) ?? null,
      ip:
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        null,
      userAgent: req.headers.get('user-agent') ?? null,
    }

    // Use absolute URL for internal fetch
    const host = req.headers.get('host') ?? 'localhost:3000'
    const proto = req.headers.get('x-forwarded-proto') ?? 'http'
    fetch(`${proto}://${host}/api/admin/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_API_KEY ?? 'soundlink-internal' },
      body: JSON.stringify(logPayload),
    }).catch(() => {})
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
