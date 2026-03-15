import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email ou nome de usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        const isEmail = credentials.identifier.includes('@')

        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: credentials.identifier.toLowerCase() }
            : { username: credentials.identifier },
        })

        if (!user || !user.password) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null

        // Block login only if a verification token is pending AND an email provider is configured
        const emailProviderConfigured = !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST)
        if (emailProviderConfigured && user.verificationToken && !user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED')
        }

        // If no email provider, auto-verify legacy unverified accounts on first login
        if (!emailProviderConfigured && !user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date(), verificationToken: null, verificationExpires: null },
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatar,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.name ?? ''
        token.role = (user as { role?: string }).role ?? 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      role: string
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role: string
  }
}
