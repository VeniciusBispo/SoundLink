'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { HiChevronLeft, HiChevronRight, HiMusicNote } from 'react-icons/hi'
import { useSession } from 'next-auth/react'
import { useRecentPlaylists } from '@/hooks/useRecentPlaylists'
import type { Playlist } from '@/types'
import PlaylistCard from '@/components/playlist/PlaylistCard'
import { useUIStore } from '@/store/uiStore'
import ContinueWatchingSection from './ContinueWatchingSection'
import AdZone from '@/components/ads/AdZone'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// ── Horizontal scrollable carousel ──────────────────────────────────────────

function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    ref.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  return (
    <div className="relative group/carousel">
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-spotify-card p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover/carousel:opacity-100 hover:bg-spotify-hover"
      >
        <HiChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-spotify-card p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover/carousel:opacity-100 hover:bg-spotify-hover"
      >
        <HiChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

// ── Compact horizontal card (used in "Continuar ouvindo") ────────────────────

function isLikelyImageSrc(v: string) {
  return /^data:image\//.test(v) || /^https?:\/\//.test(v) || v.startsWith('/')
}

function RecentCard({ item }: { item: ReturnType<typeof useRecentPlaylists>['recent'][number] }) {
  return (
    <Link
      href={`/playlist/${item.id}`}
      className="flex flex-shrink-0 items-center gap-3 rounded-xl bg-spotify-card px-3 py-2.5 transition-colors hover:bg-spotify-hover"
      style={{ width: 220, scrollSnapAlign: 'start' }}
    >
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
        {item.coverImage && isLikelyImageSrc(item.coverImage) ? (
          <Image src={item.coverImage} alt={item.name} fill className="object-cover" sizes="48px" />
        ) : item.coverImage ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-spotify-green/20 to-spotify-card">
            <span className="text-2xl">{item.coverImage}</span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-spotify-green/20 to-spotify-card">
            <HiMusicNote className="h-5 w-5 text-spotify-green/60" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
        <p className="truncate text-xs text-spotify-text">{item.songCount} músicas</p>
      </div>
    </Link>
  )
}

// ── Empty state CTA ──────────────────────────────────────────────────────────

function EmptyStateCTA({ onCreateOpen }: { onCreateOpen: () => void }) {
  const { data: session } = useSession()

  return (
    <div className="my-6 flex flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-spotify-card p-8 text-center sm:flex-row sm:text-left">
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-spotify-green/10 text-spotify-green">
        <HiMusicNote className="h-8 w-8" />
      </div>
      <div className="min-w-0 flex-1">
        {session ? (
          <>
            <h3 className="text-lg font-bold text-white">Sua biblioteca está vazia</h3>
            <p className="mt-1 text-sm text-spotify-text">
              Crie sua primeira playlist ou explore as playlists públicas da comunidade.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <button
                onClick={onCreateOpen}
                className="rounded-full bg-spotify-green px-5 py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
              >
                Criar playlist
              </button>
              <Link
                href="/explore"
                className="rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Explorar playlists
              </Link>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white">Descubra o SoundLink</h3>
            <p className="mt-1 text-sm text-spotify-text">
              Crie uma conta para salvar playlists ou explore as playlists públicas da comunidade.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link
                href="/register"
                className="rounded-full bg-spotify-green px-5 py-2 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
              >
                Criar conta
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 bg-transparent px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Entrar
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-spotify-text hover:text-white transition-colors">
          Ver tudo
        </Link>
      )}
    </div>
  )
}

// ── Main HomeClient ───────────────────────────────────────────────────────────

interface HomeClientProps {
  greeting: string
  myPlaylists: Playlist[]
  recentPublic: Playlist[]
  topByCount: Playlist[]
}

export default function HomeClient({
  greeting,
  myPlaylists: initialMyPlaylists,
  recentPublic: initialRecentPublic,
  topByCount: initialTopByCount,
}: HomeClientProps) {
  const openCreateModal = useUIStore((s) => s.openCreatePlaylistModal)

  const { data } = useSWR('/api/playlists/home', fetcher, {
    fallbackData: { 
      myPlaylists: initialMyPlaylists, 
      recentPublic: initialRecentPublic, 
      topByCount: initialTopByCount 
    },
    refreshInterval: 15000
  })

  const myPlaylists = data?.myPlaylists || initialMyPlaylists
  const recentPublic = data?.recentPublic || initialRecentPublic
  const topByCount = data?.topByCount || initialTopByCount

  const hasMyPlaylists = myPlaylists.length > 0

  return (
    <div className="py-4 md:py-6 space-y-10">
      {/* Greeting */}
      <h1 className="text-2xl font-extrabold text-white md:text-3xl">{greeting} 👋</h1>

      {/* ── Continuar Assistindo ── */}
      <ContinueWatchingSection />

      {/* ── Suas playlists ── */}
      {hasMyPlaylists ? (
        <section>
          <SectionHeader title="Suas playlists" href="/library" />
          <Carousel>
            {myPlaylists.map((pl: Playlist) => (
              <div key={pl.id} className="flex-shrink-0" style={{ width: 180, scrollSnapAlign: 'start' }}>
                <PlaylistCard playlist={pl} />
              </div>
            ))}
          </Carousel>
        </section>
      ) : (
        <EmptyStateCTA onCreateOpen={openCreateModal} />
      )}

      {/* Publicidade Home ── Substitua 'YOUR_ZONE_KEY' pela sua Key */}
      <AdZone 
        slotId="" // Adicione seu ID de bloco do AdSense aqui
        format="468x60" 
        className="opacity-60" 
      />

      {/* ── Playlists em alta (mais músicas) ── */}
      {topByCount.length > 0 && (
        <section>
          <SectionHeader title="Playlists em alta 🔥" href="/explore" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {topByCount.map((pl: Playlist) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </section>
      )}

      {/* ── Descobrir playlists recentes ── */}
      {recentPublic.length > 0 && (
        <section>
          <SectionHeader title="Adicionadas recentemente" href="/explore" />
          <Carousel>
            {recentPublic.map((pl: Playlist) => (
              <div key={pl.id} className="flex-shrink-0" style={{ width: 180, scrollSnapAlign: 'start' }}>
                <PlaylistCard playlist={pl} />
              </div>
            ))}
          </Carousel>
        </section>
      )}

      {/* ── Mini jogos - Hidden on Mobile ── */}
      <div className="hidden md:block">
        <MiniGamesSection />
      </div>
    </div>
  )
}

// ── Mini Games Section ────────────────────────────────────────────────────────

const GAMES = [
  {
    id: 'blind-test',
    emoji: '🎵',
    title: 'Blind Test',
    description: 'Ouça o trecho e adivinhe a música antes do tempo acabar.',
    gradient: 'from-purple-600/30 to-purple-900/10',
    badge: 'Em breve',
  },
  {
    id: 'lyrics-quiz',
    emoji: '📝',
    title: 'Complete a Letra',
    description: 'Preencha a letra da música com as palavras certas.',
    gradient: 'from-blue-600/30 to-blue-900/10',
    badge: 'Em breve',
  },
  {
    id: 'radar',
    emoji: '📡',
    title: 'Radar Musical',
    description: 'Descubra músicas parecidas com as que você já curte.',
    gradient: 'from-green-600/30 to-teal-900/10',
    badge: 'Novo',
  },
  {
    id: 'piano',
    emoji: '🎹',
    title: 'Piano',
    description: 'Toque um piano virtual e divirta-se criando melodias.',
    gradient: 'from-pink-600/30 to-rose-900/10',
    badge: 'Novo',
  },
]

function MiniGamesSection() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-bold text-white">Mini Jogos 🎮</h2>
        <span className="rounded-full bg-spotify-green/20 px-2 py-0.5 text-xs font-bold text-spotify-green">
          Novidade
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${game.gradient} border border-white/5 p-5 transition-all duration-200 hover:scale-[1.02] hover:border-white/10`}
          >
            <span className="text-3xl">{game.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-white">{game.title}</p>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  {game.badge}
                </span>
              </div>
              <p className="mt-1 text-xs text-spotify-text leading-relaxed">{game.description}</p>
            </div>
            {/* Decorative blur circle */}
            <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-white/5 blur-xl" />
          </Link>
        ))}
      </div>
    </section>
  )
}
