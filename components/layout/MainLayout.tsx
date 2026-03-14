'use client'

import Sidebar from './Sidebar'
import Header from './Header'
import PlayerBar from '@/components/player/PlayerBar'
import CreatePlaylistModal from '@/components/playlist/CreatePlaylistModal'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-spotify-black overflow-hidden">
      {/* Main area: sidebar + content */}
      <div className="flex flex-1 gap-2 overflow-hidden p-2 pb-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Content area */}
        <main className="flex flex-1 flex-col overflow-hidden rounded-lg bg-spotify-dark">
          <Header />
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Player fixed at bottom */}
      <PlayerBar />

      {/* Global modals */}
      <CreatePlaylistModal />
    </div>
  )
}
