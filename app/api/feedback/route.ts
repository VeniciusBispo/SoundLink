import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const feedbackSchema = z.object({
  message: z.string().min(1, 'Mensagem obrigatória').max(2000),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = feedbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { message, email } = parsed.data

    await prisma.feedback.create({
      data: {
        message,
        email: email || null,
      },
    })

    return NextResponse.json({ data: { success: true } }, { status: 201 })
  } catch (error) {
    console.error('[feedback][POST] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
