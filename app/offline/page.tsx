import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { HiWifi } from 'react-icons/hi'

export default function OfflinePage() {
  return (
    <MainLayout>
      <div className="flex h-full flex-col items-center justify-center gap-6 py-20 text-center">
        <HiWifi className="h-16 w-16 text-spotify-text" />
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">You&apos;re offline</h1>
          <p className="text-spotify-text">
            Check your internet connection. Your saved offline playlists are still accessible.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black hover:scale-105 transition-transform"
        >
          Go to Home
        </Link>
      </div>
    </MainLayout>
  )
}
