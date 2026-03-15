'use client'

import { useEffect, useState, useCallback } from 'react'
import { HiChartBar, HiSearch, HiUser, HiDesktopComputer, HiChevronLeft, HiChevronRight, HiRefresh } from 'react-icons/hi'
import AdminLayout from '@/components/admin/AdminLayout'

interface AccessLog {
  id: string
  path: string
  method: string
  userId: string | null
  username: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function shortUA(ua: string | null) {
  if (!ua) return '—'
  if (ua.includes('Mobile')) return '📱 Mobile'
  if (ua.includes('Chrome')) return '🖥 Chrome'
  if (ua.includes('Firefox')) return '🦊 Firefox'
  if (ua.includes('Safari')) return '🧭 Safari'
  return '💻 Desktop'
}

export default function AdminAccessPage() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [pathFilter, setPathFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async (p: number, path: string, user: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), path, user })
      const res = await fetch(`/api/admin/access?${params}`)
      const json = await res.json()
      setLogs(json.data ?? [])
      setTotal(json.meta?.total ?? 0)
      setPages(json.meta?.pages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchLogs(page, pathFilter, userFilter), 400)
    return () => clearTimeout(t)
  }, [page, pathFilter, userFilter, fetchLogs])

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Acessos</h2>
            <p className="text-sm text-spotify-text">{total} registros</p>
          </div>
          <div className="flex gap-2">            <button
                onClick={() => fetchLogs(page, pathFilter, userFilter)}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-[#1a1a1a] px-3 py-2 text-sm text-spotify-text ring-1 ring-white/10 hover:text-white hover:ring-white/20 transition-colors disabled:opacity-50"
                title="Atualizar lista"
              >
                <HiRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-spotify-text" />
              <input
                value={pathFilter}
                onChange={(e) => { setPathFilter(e.target.value); setPage(1) }}
                placeholder="Filtrar por página..."
                className="rounded-xl bg-[#1a1a1a] pl-9 pr-3 py-2 text-sm text-white placeholder-spotify-text outline-none ring-1 ring-white/10 focus:ring-spotify-green w-44"
              />
            </div>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-spotify-text" />
              <input
                value={userFilter}
                onChange={(e) => { setUserFilter(e.target.value); setPage(1) }}
                placeholder="Filtrar por usuário..."
                className="rounded-xl bg-[#1a1a1a] pl-9 pr-3 py-2 text-sm text-white placeholder-spotify-text outline-none ring-1 ring-white/10 focus:ring-spotify-green w-44"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-[#1a1a1a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-spotify-text">
                <th className="px-4 py-3 font-medium">Página</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Usuário</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">IP</th>
                <th className="px-4 py-3 font-medium hidden xl:table-cell">Dispositivo</th>
                <th className="px-4 py-3 font-medium">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={5} className="px-4 py-2">
                      <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-spotify-text">
                    <HiChartBar className="mx-auto mb-2 h-8 w-8 text-white/10" />
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-spotify-green">{log.path}</td>
                  <td className="px-4 py-2.5 text-spotify-text hidden md:table-cell">
                    {log.username ?? <span className="text-white/20">anônimo</span>}
                  </td>
                  <td className="px-4 py-2.5 text-spotify-text hidden lg:table-cell">{log.ip ?? '—'}</td>
                  <td className="px-4 py-2.5 text-spotify-text hidden xl:table-cell text-xs">
                    {shortUA(log.userAgent)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-spotify-text">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full p-2 text-spotify-text hover:bg-white/10 disabled:opacity-30">
              <HiChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-spotify-text">{page} / {pages}</span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="rounded-full p-2 text-spotify-text hover:bg-white/10 disabled:opacity-30">
              <HiChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
