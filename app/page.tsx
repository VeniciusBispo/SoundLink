import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MainLayout from '@/components/layout/MainLayout'
import HomeClient from '@/components/home/HomeClient'
import type { Playlist } from '@/types'

async function fetchHomeData(userId?: string) {
  const [myPlaylists, recentPublic, topByCount] = await Promise.all([
    userId
      ? prisma.playlist.findMany({
          where: { ownerId: userId },
          include: {
            owner: { select: { id: true, username: true, avatar: true } },
            _count: { select: { songs: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 12,
        })
      : [],
    prisma.playlist.findMany({
      where: { isPublic: true },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        _count: { select: { songs: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    prisma.playlist.findMany({
      where: { isPublic: true },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        _count: { select: { songs: true } },
      },
      orderBy: { songs: { _count: 'desc' } },
      take: 12,
    }),
  ])

  return {
    myPlaylists: myPlaylists as unknown as Playlist[],
    recentPublic: recentPublic as unknown as Playlist[],
    topByCount: topByCount as unknown as Playlist[],
  }
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const { myPlaylists, recentPublic, topByCount } = await fetchHomeData(session?.user?.id)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <MainLayout>
      <HomeClient
        greeting={greeting}
        myPlaylists={myPlaylists}
        recentPublic={recentPublic}
        topByCount={topByCount}
      />
    </MainLayout>
  )
}
