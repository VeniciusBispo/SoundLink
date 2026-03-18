import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'O nome de usuário deve ter no mínimo 3 caracteres')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'O nome de usuário só pode conter letras, números e sublinhados'),
  email: z.string().email('Endereço de e-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
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
      const field = existing.email === email ? 'E-mail' : 'Nome de usuário'
      return NextResponse.json({ error: `${field} já está em uso` }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const emailProviderConfigured = !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST || process.env.SMTP_PASS || process.env.BREVO_API_KEY)

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
        if (!emailSent) {
          // Se falhar ao enviar, removemos o usuário para permitir nova tentativa
          await prisma.user.delete({ where: { id: user.id } })
          console.error('[register] sendVerificationEmail returned false for:', email)
          return NextResponse.json({ error: 'Erro ao enviar e-mail. Tente novamente.' }, { status: 500 })
        }
      } catch (emailErr) {
        await prisma.user.delete({ where: { id: user.id } })
        console.error('Failed to send verification email:', emailErr)
        return NextResponse.json({ error: 'Erro de comunicação ao enviar e-mail.' }, { status: 500 })
      }
    } else if (!emailProviderConfigured) {
      console.warn('[register] No email provider configured (RESEND_API_KEY / SMTP_HOST missing). Skipping verification email.')
    }

    return NextResponse.json({ data: user, emailSent }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
