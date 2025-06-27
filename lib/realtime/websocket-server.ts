import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { EventEmitter } from 'events'
import { AnalyticsService } from '@/lib/analytics-service'
import { prisma } from '@/lib/prisma'

export interface WebSocketMessage {
  type: 'metrics' | 'event' | 'user_count' | 'system_health' | 'alert'
  data: any
  timestamp: number
}

export interface RealtimeMetrics {
  activeUsers: number
  pageViews: number
  events: number
  revenue: number
  conversions: number
  errorRate: number
  responseTime: number
  systemLoad: number
}

export interface RealtimeEvent {
  id: string
  type: string
  user?: {
    id: string
    name?: string
    email?: string
  }
  page?: string
  action: string
  metadata?: Record<string, any>
  timestamp: number
  location?: {
    country?: string
    region?: string
    city?: string
  }
}

class RealtimeAnalyticsServer extends EventEmitter {
  private wss: WebSocketServer | null = null
  private clients = new Set<WebSocket>()
  private metricsInterval: NodeJS.Timeout | null = null
  private eventBuffer: RealtimeEvent[] = []
  private maxBufferSize = 1000
  private updateInterval = 2000 // 2 seconds

  constructor() {
    super()
    this.setupEventListeners()
  }

  initialize(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/realtime/ws'
    })

    this.wss.on('connection', this.handleConnection.bind(this))
    this.startMetricsCollection()
    
    console.log('Real-time analytics WebSocket server initialized')
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    console.log('New WebSocket connection established')
    
    this.clients.add(ws)
    
    // Send initial data
    this.sendToClient(ws, {
      type: 'metrics',
      data: this.getLatestMetrics(),
      timestamp: Date.now()
    })

    // Handle client messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        this.handleClientMessage(ws, message)
      } catch (error) {
        console.error('Invalid WebSocket message:', error)
      }
    })

    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket connection closed')
      this.clients.delete(ws)
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      this.clients.delete(ws)
    })
  }

  private handleClientMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'subscribe':
        // Handle subscription to specific data streams
        break
      case 'unsubscribe':
        // Handle unsubscription
        break
      case 'filter':
        // Handle real-time filtering
        break
    }
  }

  private setupEventListeners() {
    // Listen for real-time events from the application
    this.on('new_event', this.handleNewEvent.bind(this))
    this.on('user_activity', this.handleUserActivity.bind(this))
    this.on('system_alert', this.handleSystemAlert.bind(this))
  }

  private startMetricsCollection() {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.collectRealtimeMetrics()
        this.broadcastToClients({
          type: 'metrics',
          data: metrics,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('Error collecting metrics:', error)
      }
    }, this.updateInterval)
  }

  private async collectRealtimeMetrics(): Promise<RealtimeMetrics> {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    try {
      const [activeUsers, recentPageViews, recentEvents, systemHealth] = await Promise.all([
        AnalyticsService.getActiveUsers(5),
        prisma.pageView.count({
          where: { timestamp: { gte: fiveMinutesAgo } }
        }),
        prisma.analyticsEvent.count({
          where: { timestamp: { gte: fiveMinutesAgo } }
        }),
        this.getSystemHealth()
      ])

      // Calculate revenue (mock for now - integrate with actual billing)
      const revenue = await this.calculateRealtimeRevenue(oneHourAgo)
      
      // Calculate conversion rate
      const conversions = await this.calculateConversions(oneHourAgo)

      return {
        activeUsers,
        pageViews: recentPageViews,
        events: recentEvents,
        revenue,
        conversions,
        errorRate: systemHealth.errorRate,
        responseTime: systemHealth.responseTime,
        systemLoad: systemHealth.systemLoad
      }
    } catch (error) {
      console.error('Error collecting realtime metrics:', error)
      return {
        activeUsers: 0,
        pageViews: 0,
        events: 0,
        revenue: 0,
        conversions: 0,
        errorRate: 0,
        responseTime: 0,
        systemLoad: 0
      }
    }
  }

  private async getSystemHealth() {
    // Mock system health - integrate with actual monitoring
    return {
      errorRate: Math.random() * 2, // 0-2%
      responseTime: 150 + Math.random() * 100, // 150-250ms
      systemLoad: Math.random() * 80 // 0-80%
    }
  }

  private async calculateRealtimeRevenue(since: Date): Promise<number> {
    // Mock revenue calculation - integrate with Stripe/billing
    return Math.random() * 1000
  }

  private async calculateConversions(since: Date): Promise<number> {
    try {
      const conversions = await prisma.analyticsEvent.count({
        where: {
          eventName: 'conversion',
          timestamp: { gte: since }
        }
      })
      return conversions
    } catch (error) {
      console.error('Error calculating conversions:', error)
      return 0
    }
  }

  private getLatestMetrics() {
    // Return cached metrics if available
    return {
      activeUsers: 0,
      pageViews: 0,
      events: 0,
      revenue: 0,
      conversions: 0,
      errorRate: 0,
      responseTime: 0,
      systemLoad: 0
    }
  }

  private handleNewEvent(event: RealtimeEvent) {
    // Add to buffer
    this.eventBuffer.unshift(event)
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer = this.eventBuffer.slice(0, this.maxBufferSize)
    }

    // Broadcast to clients
    this.broadcastToClients({
      type: 'event',
      data: event,
      timestamp: Date.now()
    })
  }

  private handleUserActivity(data: any) {
    this.broadcastToClients({
      type: 'user_count',
      data,
      timestamp: Date.now()
    })
  }

  private handleSystemAlert(alert: any) {
    this.broadcastToClients({
      type: 'alert',
      data: alert,
      timestamp: Date.now()
    })
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message))
      } catch (error) {
        console.error('Error sending message to client:', error)
      }
    }
  }

  private broadcastToClients(message: WebSocketMessage) {
    this.clients.forEach(client => {
      this.sendToClient(client, message)
    })
  }

  // Public methods for triggering events
  public trackEvent(event: RealtimeEvent) {
    this.emit('new_event', event)
  }

  public updateUserActivity(data: any) {
    this.emit('user_activity', data)
  }

  public triggerAlert(alert: any) {
    this.emit('system_alert', alert)
  }

  public getConnectedClients(): number {
    return this.clients.size
  }

  public close() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
    }
    
    this.clients.forEach(client => {
      client.close()
    })
    
    if (this.wss) {
      this.wss.close()
    }
  }
}

// Singleton instance
export const realtimeServer = new RealtimeAnalyticsServer()

// Helper function to track events from API routes
export function trackRealtimeEvent(event: Omit<RealtimeEvent, 'id' | 'timestamp'>) {
  const realtimeEvent: RealtimeEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  }
  
  realtimeServer.trackEvent(realtimeEvent)
}