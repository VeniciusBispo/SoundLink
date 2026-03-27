import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 🕒 In-memory Rate Limiter (SRE-level proof of concept)
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // per minute per IP
const ipCache = new Map<string, { count: number; start: number }>()

export async function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { pathname } = req.nextUrl

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/admin/log')) {
    const now = Date.now()
    const record = ipCache.get(ip)

    if (record) {
      if (now - record.start > RATE_LIMIT_WINDOW) {
        ipCache.set(ip, { count: 1, start: now })
      } else if (record.count >= MAX_REQUESTS) {
        return new NextResponse('Too Many Requests', { status: 429 })
      } else {
        record.count++
      }
    } else {
      ipCache.set(ip, { count: 1, start: now })
    }
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Protect all /admin/* routes — must be ADMIN role
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }
  }

  const response = NextResponse.next()

  // 🔐 Hardening: Security Headers (SRE/Security Engineer level)
  const headers = response.headers
  
  // Strict Content Security Policy (CSP)
  // Note: Adjusting for common domains used in the project
  const cspValue = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://adservice.google.com https://www.youtube.com https://s.ytimg.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://i.ytimg.com https://pagead2.googlesyndication.com;
    font-src 'self' data: https://fonts.gstatic.com;
    frame-src 'self' https://googleads.g.doubleclick.net https://www.youtube.com;
    connect-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net;
    worker-src 'self' blob:;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  headers.set('Content-Security-Policy', cspValue)
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // Log page visits (skip API, static, and Next internals)
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
      headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_API_KEY as string },
      body: JSON.stringify(logPayload),
    }).catch(() => {})
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
