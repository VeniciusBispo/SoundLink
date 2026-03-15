import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { username, email, password } = parsed.data

    // Check for existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username'
      return NextResponse.json({ error: `${field} already in use` }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const emailProviderConfigured = !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST)

    // Only require verification if an email provider is configured
    const verificationToken = emailProviderConfigured ? randomBytes(32).toString('hex') : null
    const verificationExpires = emailProviderConfigured ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        // Auto-verify if no email provider is configured
        emailVerified: emailProviderConfigured ? null : new Date(),
        ...(verificationToken && { verificationToken, verificationExpires }),
      },
      select: { id: true, username: true, email: true, createdAt: true },
    })

    // Send verification email if any mail provider is configured
    let emailSent = false
    if (emailProviderConfigured && verificationToken) {
      try {
        emailSent = await sendVerificationEmail(email, verificationToken)
      } catch (emailErr) {
        console.error('Failed to send verification email:', emailErr)
      }
    }

    return NextResponse.json({ data: user, emailSent }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
