// c:\Users\vinic\Desktop\Musicnews\app\api\auth\reset-password\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres' }, { status: 400 })
    }

    // Busca usuário com token válido e não expirado
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Link inválido ou expirado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Atualiza a senha, limpa o token e confirma o e-mail implicitamente
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationExpires: null,
        emailVerified: user.emailVerified ?? new Date(),
      },
    })

    return NextResponse.json({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Erro no reset-password:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
