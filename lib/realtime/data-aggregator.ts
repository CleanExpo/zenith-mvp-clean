import { EventEmitter } from 'events'
import { prisma } from '@/lib/prisma'
import { AnalyticsService } from '@/lib/analytics-service'

export interface AggregatedMetrics {
  timestamp: number
  activeUsers: number
  pageViews: number
  events: number
  revenue: number
  conversions: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{
    page: string
    views: number
    change: number
  }>
  userGrowth: Array<{
    timestamp: number
    users: number
    newUsers: number
  }>
  revenueGrowth: Array<{
    timestamp: number
    revenue: number
    growth: number
  }>
}

export interface RealtimeAlert {
  id: string
  type: 'threshold' | 'anomaly' | 'system' | 'error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: number
  acknowledged: boolean
  metadata?: Record<string, any>
}

export interface ThresholdConfig {
  metric: keyof AggregatedMetrics
  operator: 'gt' | 'lt' | 'eq' | 'ne'
  value: number
  timeWindow: number // minutes
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class RealtimeDataAggregator extends EventEmitter {
  private aggregationInterval: NodeJS.Timeout | null = null
  private metricsCache = new Map<string, any>()
  private alertsCache = new Map<string, RealtimeAlert>()
  private thresholds: ThresholdConfig[] = []
  private readonly cacheSize = 100
  private readonly aggregationFrequency = 30000 // 30 seconds

  constructor() {
    super()
    this.initializeDefaultThresholds()
  }

  start() {
    this.aggregationInterval = setInterval(
      this.performAggregation.bind(this),
      this.aggregationFrequency
    )
    console.log('Real-time data aggregator started')
  }

  stop() {
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval)
      this.aggregationInterval = null
    }
    console.log('Real-time data aggregator stopped')
  }

  private initializeDefaultThresholds() {
    this.thresholds = [
      {
        metric: 'activeUsers',
        operator: 'gt',
        value: 1000,
        timeWindow: 5,
        severity: 'medium'
      },
      {
        metric: 'bounceRate',
        operator: 'gt',
        value: 50,
        timeWindow: 10,
        severity: 'high'
      },
      {
        metric: 'avgSessionDuration',
        operator: 'lt',
        value: 60,
        timeWindow: 5,
        severity: 'medium'
      },
      {
        metric: 'conversions',
        operator: 'lt',
        value: 5,
        timeWindow: 5,
        severity: 'critical'
      }
    ]
  }

  private async performAggregation() {
    try {
      const metrics = await this.aggregateMetrics()
      this.cacheMetrics(metrics)
      this.checkThresholds(metrics)
      this.emit('metrics_updated', metrics)
    } catch (error) {
      console.error('Error during aggregation:', error)
      this.emit('aggregation_error', error)
    }
  }

  private async aggregateMetrics(): Promise<AggregatedMetrics> {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    const [activeUsers, recentPageViews, recentEvents, topPages, userGrowth, revenue] = await Promise.all([
      AnalyticsService.getActiveUsers(5),
      this.getPageViewsInTimeRange(fiveMinutesAgo, now),
      this.getEventsInTimeRange(fiveMinutesAgo, now),
      this.getTopPages(oneHourAgo, now),
      this.getUserGrowthData(oneDayAgo, now),
      this.getRevenueData(oneHourAgo, now)
    ])

    const conversions = await this.getConversionsInTimeRange(oneHourAgo, now)
    const bounceRate = await this.calculateBounceRate(oneHourAgo, now)
    const avgSessionDuration = await this.calculateAvgSessionDuration(oneHourAgo, now)
    const revenueGrowth = await this.getRevenueGrowthData(oneDayAgo, now)

    return {
      timestamp: now.getTime(),
      activeUsers,
      pageViews: recentPageViews,
      events: recentEvents,
      revenue,
      conversions,
      bounceRate,
      avgSessionDuration,
      topPages,
      userGrowth,
      revenueGrowth
    }
  }

  private async getPageViewsInTimeRange(start: Date, end: Date): Promise<number> {
    try {
      return await prisma.pageView.count({
        where: {
          timestamp: {
            gte: start,
            lte: end
          }
        }
      })
    } catch (error) {
      console.error('Error getting page views:', error)
      return 0
    }
  }

  private async getEventsInTimeRange(start: Date, end: Date): Promise<number> {
    try {
      return await prisma.analyticsEvent.count({
        where: {
          timestamp: {
            gte: start,
            lte: end
          }
        }
      })
    } catch (error) {
      console.error('Error getting events:', error)
      return 0
    }
  }

  private async getTopPages(start: Date, end: Date) {
    try {
      const topPages = await prisma.pageView.groupBy({
        by: ['page'],
        where: {
          timestamp: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })

      return topPages.map(page => ({
        page: page.page,
        views: page._count.id,
        change: Math.random() * 20 - 10 // Mock change percentage
      }))
    } catch (error) {
      console.error('Error getting top pages:', error)
      return []
    }
  }

  private async getUserGrowthData(start: Date, end: Date) {
    try {
      const intervals = this.generateTimeIntervals(start, end, 60) // 1-hour intervals
      const growthData = []

      for (const interval of intervals) {
        const users = await prisma.userSession.count({
          where: {
            startTime: {
              gte: interval.start,
              lt: interval.end
            }
          }
        })

        const newUsers = await prisma.userSession.count({
          where: {
            startTime: {
              gte: interval.start,
              lt: interval.end
            },
            // Assuming first session indicates new user
          }
        })

        growthData.push({
          timestamp: interval.start.getTime(),
          users,
          newUsers
        })
      }

      return growthData
    } catch (error) {
      console.error('Error getting user growth data:', error)
      return []
    }
  }

  private async getRevenueData(start: Date, end: Date): Promise<number> {
    // Mock revenue data - integrate with actual billing system
    return Math.random() * 5000
  }

  private async getRevenueGrowthData(start: Date, end: Date) {
    try {
      const intervals = this.generateTimeIntervals(start, end, 60) // 1-hour intervals
      const revenueData = []

      for (const interval of intervals) {
        const revenue = Math.random() * 1000 // Mock revenue
        const growth = Math.random() * 20 - 10 // Mock growth percentage

        revenueData.push({
          timestamp: interval.start.getTime(),
          revenue,
          growth
        })
      }

      return revenueData
    } catch (error) {
      console.error('Error getting revenue growth data:', error)
      return []
    }
  }

  private async getConversionsInTimeRange(start: Date, end: Date): Promise<number> {
    try {
      return await prisma.analyticsEvent.count({
        where: {
          eventName: 'conversion',
          timestamp: {
            gte: start,
            lte: end
          }
        }
      })
    } catch (error) {
      console.error('Error getting conversions:', error)
      return 0
    }
  }

  private async calculateBounceRate(start: Date, end: Date): Promise<number> {
    try {
      const totalSessions = await prisma.userSession.count({
        where: {
          startTime: {
            gte: start,
            lte: end
          }
        }
      })

      const bounceSessions = await prisma.userSession.count({
        where: {
          startTime: {
            gte: start,
            lte: end
          },
          pageViews: {
            lte: 1
          }
        }
      })

      return totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0
    } catch (error) {
      console.error('Error calculating bounce rate:', error)
      return 0
    }
  }

  private async calculateAvgSessionDuration(start: Date, end: Date): Promise<number> {
    try {
      const sessions = await prisma.userSession.findMany({
        where: {
          startTime: {
            gte: start,
            lte: end
          },
          duration: {
            not: null
          }
        },
        select: {
          duration: true
        }
      })

      if (sessions.length === 0) return 0

      const totalDuration = sessions.reduce((sum, session) => {
        return sum + (session.duration || 0)
      }, 0)

      return totalDuration / sessions.length
    } catch (error) {
      console.error('Error calculating average session duration:', error)
      return 0
    }
  }

  private generateTimeIntervals(start: Date, end: Date, intervalMinutes: number) {
    const intervals = []
    let current = new Date(start)

    while (current < end) {
      const intervalEnd = new Date(current.getTime() + intervalMinutes * 60 * 1000)
      intervals.push({
        start: new Date(current),
        end: intervalEnd > end ? end : intervalEnd
      })
      current = intervalEnd
    }

    return intervals
  }

  private cacheMetrics(metrics: AggregatedMetrics) {
    const key = `metrics_${metrics.timestamp}`
    this.metricsCache.set(key, metrics)

    // Maintain cache size
    if (this.metricsCache.size > this.cacheSize) {
      const oldestKey = this.metricsCache.keys().next().value
      if (oldestKey) {
        this.metricsCache.delete(oldestKey)
      }
    }
  }

  private checkThresholds(metrics: AggregatedMetrics) {
    this.thresholds.forEach(threshold => {
      const value = this.getMetricValue(metrics, threshold.metric)
      if (this.evaluateThreshold(value, threshold)) {
        this.generateAlert(threshold, value)
      }
    })
  }

  private getMetricValue(metrics: AggregatedMetrics, metricName: keyof AggregatedMetrics): number {
    const value = metrics[metricName]
    if (typeof value === 'number') {
      return value
    }
    return 0
  }

  private evaluateThreshold(value: number, threshold: ThresholdConfig): boolean {
    switch (threshold.operator) {
      case 'gt':
        return value > threshold.value
      case 'lt':
        return value < threshold.value
      case 'eq':
        return value === threshold.value
      case 'ne':
        return value !== threshold.value
      default:
        return false
    }
  }

  private generateAlert(threshold: ThresholdConfig, value: number) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const alert: RealtimeAlert = {
      id: alertId,
      type: 'threshold',
      severity: threshold.severity,
      title: `${threshold.metric} threshold exceeded`,
      message: `${threshold.metric} value (${value}) ${threshold.operator} ${threshold.value}`,
      timestamp: Date.now(),
      acknowledged: false,
      metadata: {
        metric: threshold.metric,
        threshold: threshold.value,
        actualValue: value,
        operator: threshold.operator
      }
    }

    this.alertsCache.set(alertId, alert)
    this.emit('alert_generated', alert)
  }

  // Public methods
  public getLatestMetrics(): AggregatedMetrics | null {
    const keys = Array.from(this.metricsCache.keys()).sort()
    const latestKey = keys[keys.length - 1]
    return latestKey ? this.metricsCache.get(latestKey) || null : null
  }

  public getMetricsHistory(count: number = 10): AggregatedMetrics[] {
    const keys = Array.from(this.metricsCache.keys()).sort()
    const recentKeys = keys.slice(-count)
    return recentKeys.map(key => this.metricsCache.get(key)).filter(Boolean)
  }

  public getActiveAlerts(): RealtimeAlert[] {
    return Array.from(this.alertsCache.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alertsCache.get(alertId)
    if (alert) {
      alert.acknowledged = true
      this.alertsCache.set(alertId, alert)
      this.emit('alert_acknowledged', alert)
      return true
    }
    return false
  }

  public addThreshold(threshold: ThresholdConfig) {
    this.thresholds.push(threshold)
    this.emit('threshold_added', threshold)
  }

  public removeThreshold(index: number) {
    if (index >= 0 && index < this.thresholds.length) {
      const removed = this.thresholds.splice(index, 1)[0]
      this.emit('threshold_removed', removed)
      return removed
    }
    return null
  }

  public getThresholds(): ThresholdConfig[] {
    return [...this.thresholds]
  }
}

// Singleton instance
export const dataAggregator = new RealtimeDataAggregator()