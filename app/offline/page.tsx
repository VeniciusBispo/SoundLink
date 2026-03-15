'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { HiWifi, HiMusicNote } from 'react-icons/hi'
import { getAllOfflinePlaylists } from '@/services/offlineService'
import type { OfflinePlaylistRecord } from '@/types'

export default function OfflinePage() {
  const [saved, setSaved] = useState<OfflinePlaylistRecord[]>([])

  useEffect(() => {
    getAllOfflinePlaylists().then(setSaved).catch(() => {})
  }, [])

  return (
    <MainLayout>
      <div className="px-4 py-8 md:px-6">
        {/* Status banner */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <HiWifi className="h-12 w-12 text-spotify-text" />
          <div>
            <h1 className="text-2xl font-bold text-white">Sem conexão</h1>
            <p className="mt-1 text-sm text-spotify-text">
              Verifique sua conexão. Suas playlists salvas offline estão abaixo.
            </p>
          </div>
        </div>

        {/* Saved offline playlists */}
        {saved.length > 0 ? (
          <div>
            <h2 className="mb-3 text-lg font-bold text-white">Salvas offline</h2>
            <div className="flex flex-col gap-2">
              {saved.map((record) => (
                <Link
                  key={record.playlistId}
                  href={`/playlist/${record.playlistId}`}
                  className="flex items-center gap-3 rounded-xl bg-spotify-card p-3 transition-colors hover:bg-spotify-hover"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-800/60 to-spotify-card">
                    <HiMusicNote className="h-6 w-6 text-spotify-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{record.playlist.name}</p>
                    <p className="truncate text-xs text-spotify-text">
                      {record.songIds.length} músicas • Salva em{' '}
                      {new Date(record.savedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-spotify-text">
            Nenhuma playlist salva offline ainda. Abra uma playlist e clique em &ldquo;Salvar offline&rdquo;.
          </p>
        )}
      </div>
    </MainLayout>
  )
}
