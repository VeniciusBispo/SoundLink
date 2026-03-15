import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/auth/verify-email?token=xxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=token_missing', req.url))
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=token_invalid', req.url))
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationExpires: null,
      },
    })

    return NextResponse.redirect(new URL('/login?verified=1', req.url))
  } catch {
    return NextResponse.redirect(new URL('/login?error=server_error', req.url))
  }
}
