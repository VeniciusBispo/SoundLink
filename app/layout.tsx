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
  title: 'SoundLink – Sua Música, Do Seu Jeito',
  description:
    'Crie playlists, adicione músicas do YouTube e ouça em qualquer lugar. Pública, privada e disponível offline.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#1DB954',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* Preconectar e Precarregar domínios de anúncios para performance extrema */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossOrigin="anonymous" />
        
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://adservice.google.com" />

        {/* Priority Hint para AdSense discovery antecipado */}
        <link 
          rel="preload" 
          href="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9556522152269793" 
          as="script"
          //@ts-ignore
          fetchpriority="high"
        />
      </head>
      <body className={`${inter.variable} bg-spotify-black font-sans antialiased`}>
        {/* Google AdSense - Standard script to avoid data-nscript error */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9556522152269793"
          crossOrigin="anonymous"
        />
        <Providers session={session}>
          <PlayerProvider>{children}</PlayerProvider>
        </Providers>
      </body>
    </html>
  )
}
