import { type NextAuthOptions, type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
// import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Netlify DNS sometimes appends a trailing dot to the domain (e.g. "app.netlify.app.")
// which breaks NextAuth's server-side URL validation and redirect building.
// Sanitize it once at module load so every NextAuth operation uses the clean URL.
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.replace(/\.(?=\/|$)/, '')
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email ou nome de usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          // Retornar null indica falha genérica de credenciais
          return null
        }

        const isEmail = credentials.identifier.includes('@')

        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: credentials.identifier.toLowerCase() }
            : { username: credentials.identifier },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) return null

        const emailProviderConfigured = !!(
          process.env.BREVO_API_KEY ||
          process.env.SMTP_PASS ||
          process.env.SMTP_HOST ||
          process.env.RESEND_API_KEY
        )

        // Ao lançar erro aqui SEM o try/catch, o NextAuth redireciona para:
        // /api/auth/signin?error=EMAIL_NOT_VERIFIED
        if (emailProviderConfigured && user.verificationToken && !user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED")
        }

        if (!emailProviderConfigured && !user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: new Date(),
              verificationToken: null,
              verificationExpires: null
            },
          })
        }

        return {
          id: user.id,
          email: user.email!, // Email é obrigatório no seu schema
          username: user.username,
          role: user.role,
          avatar: user.avatar,
          banner: user.banner
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
        token.email = user.email // email is required on our user
        token.username = user.username
        token.role = user.role
        // Do not add large fields like avatar/banner to the JWT to keep it small
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.username = token.username
        session.user.role = token.role

        // To avoid bloating the JWT, we fetch non-critical session data on-demand.
        const userDetails = await prisma.user.findUnique({
          where: { id: token.id },
          select: { avatar: true, banner: true },
        })
        session.user.avatar = userDetails?.avatar ?? null
        session.user.banner = userDetails?.banner ?? null
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend the built-in session types
declare module 'next-auth' {
  interface User {
    id: string
    username: string
    email: string
    role: string
    avatar: string | null
    banner: string | null
  }
}
