// c:\Users\vinic\Desktop\Musicnews\app\api\auth\forgot-password\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendResetEmail } from '@/lib/reset-mail'

export async function POST(req: NextRequest) {
  try {
    const { email, username } = await req.json()

    if (!email || !username) {
      return NextResponse.json({ error: 'E-mail e Nome de Usuário são obrigatórios' }, { status: 400 })
    }

    // Busca o usuário pelo e-mail
    const user = await prisma.user.findFirst({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Nenhuma conta encontrada com este e-mail' }, { status: 404 })
    }

    // Verifica se o username bate
    if (user.username !== username) {
      return NextResponse.json({ error: 'O nome de usuário não corresponde a este e-mail' }, { status: 400 })
    }

    // Gera token e envia e-mail
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Salva o token no banco reutilizando os campos de verificação
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationExpires: expires,
      },
    })

    await sendResetEmail(user.email!, token)

    // Retorna mensagem genérica por segurança
    return NextResponse.json({
      message: 'Se uma conta com este e-mail existir, um link de recuperação foi enviado.',
    })
  } catch (error) {
    console.error('Erro no forgot-password:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
