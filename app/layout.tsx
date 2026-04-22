import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Providers from './providers'
import PlayerProvider from '@/components/player/PlayerProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

import Script from 'next/script'

export const metadata: Metadata = {
  title: 'SoundLink – Sua Música, Do Seu Jeito | Player de Música Personalizado',
  description:
    'A plataforma definitiva para organizar suas músicas do YouTube em playlists personalizadas. Ouça música grátis, crie coleções públicas ou privadas, e jogue mini-games musicais.',
  manifest: '/manifest.json',
  keywords: ['música', 'player de música', 'playlists youtube', 'ouvir música grátis', 'pwa música', 'soundlink', 'organizador de música'],
  authors: [{ name: 'SoundLink Team' }],
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://soundlink.app',
    siteName: 'SoundLink',
    title: 'SoundLink – Sua Música, Do Seu Jeito',
    description: 'A plataforma definitiva para organizar suas músicas do YouTube em playlists personalizadas.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SoundLink Preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoundLink – Player de Música Personalizado',
    description: 'Organize suas músicas do YouTube em playlists personalizadas com SoundLink.',
    images: ['/og-image.png'],
  },
}


export const viewport: Viewport = {
  themeColor: '#EF4444',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* Preconectar e Precarregar domínios de anúncios para performance extrema */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube.com" crossOrigin="anonymous" />
        
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://adservice.google.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
      </head>
      <body className={`${inter.variable} bg-brand-black font-sans antialiased`}>
        {/* Google AdSense - Extreme Performance Strategy */}
        <Script
          id="adsense-init"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9556522152269793"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Providers session={session}>
          <PlayerProvider>{children}</PlayerProvider>
        </Providers>
      </body>
    </html>
  )
}
