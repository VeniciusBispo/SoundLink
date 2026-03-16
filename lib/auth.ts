import { NextAuthOptions } from 'next-auth'
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
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email ou nome de usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log("AUTH START")
          console.log("LOGIN ATTEMPT:", credentials?.identifier)

          if (!credentials?.identifier || !credentials?.password) {
            console.log("Missing credentials")
            return null
          }

          const isEmail = credentials.identifier.includes('@')

          const user = await prisma.user.findFirst({
            where: isEmail
              ? { email: credentials.identifier.toLowerCase() }
              : { username: credentials.identifier },
          })

          console.log("USER FOUND:", user?.id)

          if (!user || !user.password) {
            console.log("User not found or missing password")
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          console.log("PASSWORD VALID:", isPasswordValid)

          if (!isPasswordValid) return null

          const emailProviderConfigured =
            !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST)

          if (emailProviderConfigured && user.verificationToken && !user.emailVerified) {
            console.log("Email not verified")
            return { error: "EMAIL_NOT_VERIFIED" } as any
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
            email: user.email,
            name: user.username,
            image: user.avatar,
            role: user.role,
            avatar: user.avatar,
            banner: user.banner
          }

        } catch (error) {
          console.error("AUTH ERROR:", error)
          return null
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
        token.avatar = (user as any).avatar ?? null
        token.banner = (user as any).banner ?? null
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
        session.user.avatar = (token as any).avatar ?? null
        session.user.banner = (token as any).banner ?? null
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
  interface Session {
    user: {
      id: string
      username: string
      email: string
      role?: string
      image?: string | null
      avatar?: string | null
      banner?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role?: string
  }
}
