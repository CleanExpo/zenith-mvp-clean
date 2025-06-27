import { NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/analytics-service'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Get real-time metrics
    const [activeUsers, recentPageViews, recentEvents] = await Promise.all([
      AnalyticsService.getActiveUsers(5),
      prisma.pageView.count({
        where: { timestamp: { gte: fiveMinutesAgo } }
      }),
      prisma.analyticsEvent.count({
        where: { timestamp: { gte: fiveMinutesAgo } }
      })
    ])

    // Mock additional metrics (in production, these would come from actual monitoring)
    const metrics = {
      activeUsers,
      pageViews: recentPageViews,
      events: recentEvents,
      revenue: Math.random() * 1000, // Mock revenue
      conversions: Math.floor(Math.random() * 20),
      errorRate: Math.random() * 2, // 0-2%
      responseTime: 150 + Math.random() * 100, // 150-250ms
      systemLoad: Math.random() * 80, // 0-80%
      timestamp: now.getTime()
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching real-time metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}