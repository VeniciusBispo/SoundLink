'use client'

import { useEffect, useState } from 'react'
import { HiUsers, HiMusicNote, HiCollection, HiChatAlt2, HiEye, HiTrendingUp } from 'react-icons/hi'
import AdminLayout from '@/components/admin/AdminLayout'

interface Stats {
  users: { total: number; today: number; week: number }
  playlists: { total: number; public: number }
  songs: { total: number }
  feedback: { total: number; unread: number }
  access: {
    total: number
    today: number
    week: number
    topPaths: { path: string; _count: { path: number } }[]
    visitsByDay: Record<string, number>
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-spotify-green',
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color?: string
}) {
  return (
    <div className="rounded-xl bg-[#1a1a1a] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-spotify-text">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-3xl font-extrabold text-white">{value.toLocaleString('pt-BR')}</p>
      {sub && <p className="text-xs text-spotify-text">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  // Build simple bar chart from visitsByDay
  const chartData = stats
    ? Object.entries(stats.access.visitsByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7)
    : []
  const maxVisits = Math.max(...chartData.map(([, v]) => v), 1)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-spotify-text mt-0.5">Visão geral do SoundLink</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-[#1a1a1a]" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard icon={HiUsers} label="Usuários" value={stats.users.total} sub={`+${stats.users.today} hoje · +${stats.users.week} esta semana`} />
              <StatCard icon={HiCollection} label="Playlists" value={stats.playlists.total} sub={`${stats.playlists.public} públicas`} color="text-blue-400" />
              <StatCard icon={HiMusicNote} label="Músicas" value={stats.songs.total} color="text-purple-400" />
              <StatCard icon={HiChatAlt2} label="Feedbacks" value={stats.feedback.total} sub={`${stats.feedback.unread} não lidos`} color="text-yellow-400" />
              <StatCard icon={HiEye} label="Visitas hoje" value={stats.access.today} sub={`${stats.access.week} esta semana`} color="text-pink-400" />
              <StatCard icon={HiTrendingUp} label="Total visitas" value={stats.access.total} color="text-orange-400" />
            </div>

            {/* Chart + top paths */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Bar chart of visits per day */}
              <div className="rounded-xl bg-[#1a1a1a] p-5">
                <p className="mb-4 text-sm font-semibold text-white">Visitas por dia (últimos 7 dias)</p>
                {chartData.length === 0 ? (
                  <p className="text-sm text-spotify-text">Sem dados ainda.</p>
                ) : (
                  <div className="flex items-end gap-2 h-32">
                    {chartData.map(([day, count]) => (
                      <div key={day} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] text-spotify-text">{count}</span>
                        <div
                          className="w-full rounded-t bg-spotify-green/70 transition-all"
                          style={{ height: `${Math.max(4, (count / maxVisits) * 100)}%` }}
                        />
                        <span className="text-[9px] text-spotify-text truncate w-full text-center">
                          {day.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top paths */}
              <div className="rounded-xl bg-[#1a1a1a] p-5">
                <p className="mb-4 text-sm font-semibold text-white">Páginas mais acessadas (7 dias)</p>
                {stats.access.topPaths.length === 0 ? (
                  <p className="text-sm text-spotify-text">Sem dados ainda.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {stats.access.topPaths.map(({ path, _count }) => (
                      <div key={path} className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm text-white font-mono">{path}</span>
                        <span className="flex-shrink-0 rounded-full bg-spotify-green/10 px-2.5 py-0.5 text-xs font-bold text-spotify-green">
                          {_count.path}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-spotify-text">Falha ao carregar estatísticas.</p>
        )}
      </div>
    </AdminLayout>
  )
}
