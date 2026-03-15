import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminGuard'

// GET /api/admin/stats — dashboard numbers
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOf30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const startOf7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    newUsersToday,
    newUsers7d,
    totalPlaylists,
    publicPlaylists,
    totalSongs,
    totalFeedback,
    unreadFeedback,
    totalLogs,
    logsToday,
    logs7d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { createdAt: { gte: startOf7Days } } }),
    prisma.playlist.count(),
    prisma.playlist.count({ where: { isPublic: true } }),
    prisma.song.count(),
    prisma.feedback.count(),
    Promise.resolve(0), // unread count placeholder (no readAt field in schema)
    prisma.accessLog.count(),
    prisma.accessLog.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.accessLog.count({ where: { createdAt: { gte: startOf7Days } } }),
  ])

  // Top 5 most visited paths in last 7 days — using groupBy
  const topPaths = await prisma.accessLog.groupBy({
    by: ['path'],
    where: { createdAt: { gte: startOf7Days } },
    _count: { path: true },
    orderBy: { _count: { path: 'desc' } },
    take: 5,
  })

  // Daily visits for last 7 days
  const dailyVisits = await prisma.accessLog.findMany({
    where: { createdAt: { gte: startOf7Days } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Group by day
  const visitsByDay: Record<string, number> = {}
  dailyVisits.forEach(({ createdAt }) => {
    const day = createdAt.toISOString().slice(0, 10)
    visitsByDay[day] = (visitsByDay[day] ?? 0) + 1
  })

  return NextResponse.json({
    users: { total: totalUsers, today: newUsersToday, week: newUsers7d },
    playlists: { total: totalPlaylists, public: publicPlaylists },
    songs: { total: totalSongs },
    feedback: { total: totalFeedback, unread: unreadFeedback },
    access: { total: totalLogs, today: logsToday, week: logs7d, topPaths, visitsByDay },
  })
}
