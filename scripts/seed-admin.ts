/**
 * Script para criar o primeiro usuário admin.
 * 
 * Uso:
 *   npx ts-node --project tsconfig.json scripts/seed-admin.ts
 * 
 * Ou com tsx:
 *   npx tsx scripts/seed-admin.ts
 * 
 * Variáveis que podem ser sobrescritas por env:
 *   ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.ADMIN_USERNAME ?? 'admin'
  const email = process.env.ADMIN_EMAIL ?? 'admin@soundlink.app'
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@123!'

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN', emailVerified: existing.emailVerified ?? new Date() },
      })
      console.log(`✅ Usuário existente "${existing.username}" promovido para ADMIN.`)
    } else {
      console.log(`ℹ️  Usuário admin "${existing.username}" já existe.`)
    }
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Admin criado com sucesso:`)
  console.log(`   Username : ${user.username}`)
  console.log(`   Email    : ${user.email}`)
  console.log(`   Senha    : ${password}`)
  console.log()
  console.log('⚠️  Troque a senha após o primeiro login!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar admin:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
