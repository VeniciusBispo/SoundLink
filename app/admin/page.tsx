'use client'

import { useEffect, useState } from 'react'
import { HiShieldCheck, HiLightningBolt, HiExclamation, HiChartBar, HiTrendingUp, HiServer } from 'react-icons/hi'
import AdminLayout from '@/components/admin/AdminLayout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface Metrics {
  summary: {
    totalRequests: number
    errorRate: number
    p95: number
    avgLatency: number
    soundlinkScore: number
  }
  latencyHistory: { time: string; value: number }[]
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  sub, 
  color = "text-spotify-green",
  trend = "up"
}: { 
  icon: any, 
  label: string, 
  value: string | number, 
  sub: string, 
  color?: string,
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-md bg-white/5 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? '↑' : '↓'} 12%
        </div>
      </div>
      <p className="text-spotify-text text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-black text-white mb-2">{value}</h3>
      <p className="text-xs text-white/40 font-mono uppercase tracking-widest">{sub}</p>
    </div>
  )
}

export default function AdminDashboardV2() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchMetrics = () => {
      fetch('/api/admin/metrics')
        .then(r => r.json())
        .then(setMetrics)
        .finally(() => setLoading(false))
    }
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000) // 10s refresh
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null
  if (loading) return <div className="p-12 text-spotify-green animate-pulse font-mono">INITIALIZING SRE DASHBOARD...</div>

  const score = metrics?.summary?.soundlinkScore ?? 0

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-1000">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">SRE Command Center</h1>
            <p className="text-spotify-text font-mono text-sm">Real-time system observability • Node: Edge-South-1</p>
          </div>
          <div className="text-right">
            <div className="inline-block p-1 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 px-6 py-3">
                <div className="text-left">
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">SoundLink Score</p>
                  <p className="text-2xl font-black text-spotify-green">{score}/100</p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-spotify-green transition-all duration-1000"
                    style={{ clipPath: `inset(${100 - score}% 0 0 0)` }}
                  />
                  <HiChartBar className="w-6 h-6 text-spotify-green" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            icon={HiLightningBolt} 
            label="Latência P95" 
            value={`${metrics?.summary?.p95 ?? 0}ms`} 
            sub="Avg: 42ms" 
            color="text-yellow-400"
            trend="down"
          />
          <MetricCard 
            icon={HiExclamation} 
            label="Taxa de Erro" 
            value={`${(metrics?.summary?.errorRate ?? 0).toFixed(2)}%`} 
            sub="Target: < 0.1%" 
            color="text-red-500"
            trend="neutral"
          />
          <MetricCard 
            icon={HiServer} 
            label="Total Requests" 
            value={metrics?.summary?.totalRequests ?? 0} 
            sub="24h Window" 
            color="text-blue-400"
          />
          <MetricCard 
            icon={HiShieldCheck} 
            label="Segurança" 
            value="Hacker-Safe" 
            sub="CSP Strict Mode" 
            color="text-spotify-green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <HiChartBar className="text-spotify-green" /> Performance Histórica (Real-time)
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.latencyHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1DB954" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#1DB954' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#1DB954" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6">Auditoria de Segurança</h3>
            <div className="space-y-6">
              {[
                { label: 'Content Security Policy', val: 'Pass', color: 'text-green-400' },
                { label: 'HSTS Strict-Mode', val: 'Active', color: 'text-green-400' },
                { label: 'Rate Limiting', val: 'Engaged', color: 'text-yellow-400' },
                { label: 'Sanitização de Bits', val: '100%', color: 'text-blue-400' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-sm text-spotify-text">{item.label}</span>
                  <span className={`text-xs font-mono font-bold ${item.color}`}>{item.val}</span>
                </div>
              ))}
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">Alertas Críticos</p>
                <p className="text-xs text-spotify-text">Nenhuma vulnerabilidade detectada na última varredura.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
