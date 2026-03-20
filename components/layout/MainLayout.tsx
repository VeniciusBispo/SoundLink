'use client'

import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Header from './Header'
import PlayerBar from '@/components/player/PlayerBar'
import CreatePlaylistModal from '@/components/playlist/CreatePlaylistModal'
import AdFooter from '@/components/ads/AdFooter'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-[100dvh] flex-col bg-spotify-black overflow-hidden">
      {/* Main area: sidebar (desktop) + content */}
      <div className="flex flex-1 gap-2 overflow-hidden md:p-2 md:pb-0">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex md:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Content area */}
        <main className="flex flex-1 flex-col overflow-hidden md:rounded-lg md:bg-spotify-dark bg-spotify-black">
          <Header />
          <div className="flex-1 overflow-y-auto px-4 pb-6 md:px-6">
            {children}
          </div>
        </main>
      </div>


      {/* Player fixed at bottom */}
      <PlayerBar />

      {/* Footer de anúncio fixo acima da navegação mobile */}
      <AdFooter />

      {/* Mobile bottom nav — visible only on mobile */}
      <MobileNav />

      {/* Global modals */}
      <CreatePlaylistModal />
    </div>
  )
}
