'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import Link from 'next/link'
import { HiWifi, HiMusicNote, HiTrash } from 'react-icons/hi'
import { getAllOfflinePlaylists, getStorageEstimate, removeOfflinePlaylist } from '@/services/offlineService'
import type { OfflinePlaylistRecord, StorageEstimate } from '@/types'

export default function OfflinePage() {
  const [saved, setSaved] = useState<OfflinePlaylistRecord[]>([])
  const [storage, setStorage] = useState<StorageEstimate>({ usage: 0, quota: 0 })

  const loadData = () => {
    getAllOfflinePlaylists().then(setSaved).catch(() => {})
    getStorageEstimate().then(setStorage).catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('Deseja remover os downloads desta playlist?')) {
      await removeOfflinePlaylist(id)
      loadData()
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <MainLayout>
      <div className="px-4 py-8 md:px-6">
        {/* Status banner */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <HiWifi className="h-12 w-12 text-spotify-text" />
          <div>
            <h1 className="text-2xl font-bold text-white">Modo Offline</h1>
            <p className="mt-1 text-sm text-spotify-text">
              Músicas baixadas para ouvir sem internet.
            </p>
          </div>
          {storage.usage > 0 && (
            <div className="text-xs text-spotify-text bg-white/5 py-1.5 px-3 rounded-full mt-2">
              Armazenamento Web: <span className="font-semibold text-white">{formatBytes(storage.usage)}</span> usados
              {storage.quota > 0 && ` de ${formatBytes(storage.quota)}`}
            </div>
          )}
        </div>

        {/* Saved offline playlists */}
        {saved.length > 0 ? (
          <div>
            <h2 className="mb-3 text-lg font-bold text-white">Suas Playlists Baixadas</h2>
            <div className="flex flex-col gap-2">
              {saved.map((record) => (
                <Link
                  key={record.playlistId}
                  href={`/playlist/${record.playlistId}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl bg-[#181818] p-3 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-spotify-green to-purple-800 shadow">
                      <HiMusicNote className="h-7 w-7 text-black" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[15px] text-white">{record.playlist.name}</p>
                      <p className="truncate text-[13px] text-spotify-text">
                        {record.songIds.length} músicas • Baixada em {new Date(record.savedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleRemove(record.playlistId, e)}
                    className="flex shrink-0 items-center justify-center rounded-full p-2 text-spotify-text hover:bg-red-500/20 hover:text-red-400 self-end md:self-auto transition-colors"
                    aria-label="Remover do celular"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center rounded-xl border border-white/10 bg-white/5 p-8 mt-4">
            <p className="text-sm font-medium text-white mb-2">Nenhum download encontrado.</p>
            <p className="text-[13px] text-spotify-text">
              Para ouvir músicas offline, abra uma playlist e clique no botão de Download.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
