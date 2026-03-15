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

    // Generate email verification token (24-hour expiry)
    const verificationToken = randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken,
        verificationExpires,
      },
      select: { id: true, username: true, email: true, createdAt: true },
    })

    // Send verification email if SMTP is configured
    if (process.env.SMTP_HOST) {
      try {
        await sendVerificationEmail(email, verificationToken)
      } catch (emailErr) {
        console.error('Failed to send verification email:', emailErr)
        // Don't fail registration if email sending fails
      }
    }

    return NextResponse.json({ data: user }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
