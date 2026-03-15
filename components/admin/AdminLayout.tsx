'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import {
  HiViewGrid,
  HiUsers,
  HiChatAlt2,
  HiChartBar,
  HiLogout,
  HiShieldCheck,
  HiMusicNote,
} from 'react-icons/hi'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Painel', icon: HiViewGrid, exact: true },
  { href: '/admin/users', label: 'Usuários', icon: HiUsers },
  { href: '/admin/feedback', label: 'Feedbacks', icon: HiChatAlt2 },
  { href: '/admin/access', label: 'Acessos', icon: HiChartBar },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.replace('/')
    }
  }, [status, session, router])

  if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[#0d0d0d]">
      {/* Sidebar */}
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-white/5 bg-[#111111]">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-white/5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-spotify-green">
            <HiShieldCheck className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white">SoundLink</p>
            <p className="text-[10px] font-medium text-spotify-green uppercase tracking-widest">Administração</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-spotify-green/10 text-spotify-green'
                    : 'text-spotify-text hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-spotify-green')} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 p-3 flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-spotify-text hover:bg-white/5 hover:text-white transition-colors"
          >
            <HiMusicNote className="h-5 w-5" />
            Voltar ao site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: `${window.location.origin.replace(/\.$/, '')}/login` })}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-spotify-text hover:bg-white/5 hover:text-white transition-colors text-left"
          >
            <HiLogout className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#111111] px-6">
          <h1 className="text-sm font-semibold text-white">
            {navItems.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label ?? 'Admin'}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-spotify-green text-xs font-bold text-black">
              {session.user.username[0].toUpperCase()}
            </div>
            <span className="text-sm text-white">{session.user.username}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
