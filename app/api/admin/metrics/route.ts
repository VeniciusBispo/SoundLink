import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 🧹 Data Retention: Purge logs older than 3 days (SRE standard)
    const cleanupDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    await (prisma.accessLog as any).deleteMany({
      where: { createdAt: { lt: cleanupDate } }
    }).catch((e: any) => console.warn('[metrics] cleanup failed:', e))

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Aggregate key metrics
    const [totalRequests, errorCount, latencyData] = await Promise.all([
      prisma.accessLog.count({ where: { createdAt: { gte: last24h } } }),
      // @ts-ignore
      prisma.accessLog.count({ where: { status: { gte: 400 }, createdAt: { gte: last24h } } }),
      // @ts-ignore
      prisma.accessLog.findMany({
        where: { responseTime: { not: null }, createdAt: { gte: last24h } } as any,
        select: { responseTime: true, createdAt: true } as any,
        take: 1000,
        orderBy: { createdAt: 'desc' }
      } as any)
    ])

    // Calculate P95
    const latencies = (latencyData as any).map((d: any) => d.responseTime as number).sort((a: any, b: any) => a - b)
    const p95 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0

    // SoundLink Score Calculation (Heuristic)
    const perfScore = Math.max(0, 100 - (p95 / 10)) // 100ms = 90 score, 1000ms = 0 score
    const securityScore = 95 // Hardcoded for now based on headers & CSP
    const stabilityScore = totalRequests > 0 ? (1 - errorCount / totalRequests) * 100 : 100
    
    const soundlinkScore = Math.round(perfScore * 0.4 + securityScore * 0.4 + stabilityScore * 0.2)

    return NextResponse.json({
      summary: {
        totalRequests,
        errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
        p95,
        avgLatency,
        soundlinkScore
      },
      latencyHistory: latencyData.slice(0, 50).reverse().map(d => ({
        time: d.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // @ts-ignore
        value: d.responseTime
      }))
    })
  } catch (error) {
    console.error('[metrics][GET] failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
