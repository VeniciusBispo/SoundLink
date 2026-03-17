// c:\Users\vinic\Desktop\Musicnews\app\api\auth\forgot-password\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendResetEmail } from '@/lib/reset-mail'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })
    }

    // Busca o usuário
    const user = await prisma.user.findFirst({
      where: { email },
    })

    // Se o usuário existir, gera token e envia e-mail
    if (user) {
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
    }

    // Retorna mensagem genérica por segurança
    return NextResponse.json({
      message: 'Se uma conta com este e-mail existir, um link de recuperação foi enviado.',
    })
  } catch (error) {
    console.error('Erro no forgot-password:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
