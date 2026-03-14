'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import PlaylistGrid from '@/components/playlist/PlaylistGrid'
import Button from '@/components/ui/Button'
import { useMyPlaylists } from '@/hooks/usePlaylist'
import { useUIStore } from '@/store/uiStore'
import { getProfile } from '@/services/authService'
import { HiMusicNote, HiUser } from 'react-icons/hi'

interface Profile {
  id: string
  username: string
  email: string
  avatar?: string | null
  createdAt: string
  _count: { playlists: number }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { playlists } = useMyPlaylists()
  const openCreatePlaylistModal = useUIStore((s) => s.openCreatePlaylistModal)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      getProfile().then(setProfile).catch(console.error)
    }
  }, [status, router])

  if (status === 'loading' || !profile) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* Profile hero */}
      <div className="flex items-center gap-6 bg-gradient-to-b from-indigo-900/50 to-transparent px-6 py-10">
        <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <HiUser className="h-16 w-16 text-white" />
          )}
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-white/70">Profile</p>
          <h1 className="mb-2 text-4xl font-black text-white">{profile.username}</h1>
          <p className="text-sm text-spotify-text">{profile.email}</p>
          <p className="mt-1 text-sm text-spotify-text">
            <HiMusicNote className="mr-1 inline h-4 w-4" />
            {profile._count.playlists} playlists
          </p>
        </div>
      </div>

      {/* Playlists section */}
      <div className="px-6 pb-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
          <Button onClick={openCreatePlaylistModal} size="sm">
            New playlist
          </Button>
        </div>
        <PlaylistGrid playlists={playlists} />
      </div>
    </MainLayout>
  )
}
