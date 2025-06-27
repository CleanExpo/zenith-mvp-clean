// Demo data generator for real-time analytics dashboard
// This provides realistic-looking data when WebSocket connections aren't available

export interface DemoMetrics {
  activeUsers: number
  pageViews: number
  events: number
  revenue: number
  conversions: number
  errorRate: number
  responseTime: number
  systemLoad: number
  timestamp: number
}

export interface DemoEvent {
  id: string
  type: 'page_view' | 'user_action' | 'conversion' | 'auth' | 'error'
  user?: {
    id: string
    name: string
    email: string
  }
  page: string
  action: string
  timestamp: number
  location?: {
    country: string
    region: string
    city: string
  }
  metadata?: {
    device: string
    browser: string
    referrer?: string
    [key: string]: any
  }
}

class DemoDataGenerator {
  private baseMetrics: DemoMetrics = {
    activeUsers: 1247,
    pageViews: 156,
    events: 89,
    revenue: 2340,
    conversions: 12,
    errorRate: 0.8,
    responseTime: 145,
    systemLoad: 45,
    timestamp: Date.now()
  }

  private readonly pages = [
    '/dashboard',
    '/dashboard/realtime',
    '/tools/website-analyzer',
    '/pricing',
    '/settings',
    '/teams',
    '/billing',
    '/analytics'
  ]

  private readonly actions = {
    page_view: ['visited', 'loaded', 'refreshed', 'navigated_to'],
    user_action: ['clicked', 'searched', 'uploaded', 'downloaded', 'shared', 'commented'],
    conversion: ['signed_up', 'upgraded', 'purchased', 'subscribed', 'trial_started'],
    auth: ['logged_in', 'logged_out', 'password_reset', 'account_created'],
    error: ['404_error', 'api_error', 'timeout', 'validation_error']
  }

  private readonly locations = [
    { country: 'United States', region: 'California', city: 'San Francisco' },
    { country: 'United States', region: 'New York', city: 'New York' },
    { country: 'United Kingdom', region: 'England', city: 'London' },
    { country: 'Germany', region: 'Berlin', city: 'Berlin' },
    { country: 'France', region: 'Île-de-France', city: 'Paris' },
    { country: 'Japan', region: 'Tokyo', city: 'Tokyo' },
    { country: 'Canada', region: 'Ontario', city: 'Toronto' },
    { country: 'Australia', region: 'New South Wales', city: 'Sydney' },
    { country: 'Brazil', region: 'São Paulo', city: 'São Paulo' },
    { country: 'India', region: 'Maharashtra', city: 'Mumbai' }
  ]

  private readonly devices = ['desktop', 'mobile', 'tablet']
  private readonly browsers = ['Chrome', 'Safari', 'Firefox', 'Edge']
  private readonly referrers = ['direct', 'google.com', 'twitter.com', 'linkedin.com', 'github.com']

  generateMetrics(): DemoMetrics {
    // Apply realistic variations to base metrics
    const now = Date.now()
    const timeSinceLastUpdate = now - this.baseMetrics.timestamp
    const variation = Math.random() * 0.1 - 0.05 // ±5% variation
    
    this.baseMetrics = {
      activeUsers: Math.max(100, Math.round(this.baseMetrics.activeUsers * (1 + variation))),
      pageViews: Math.max(0, Math.round(this.baseMetrics.pageViews + Math.random() * 20 - 5)),
      events: Math.max(0, Math.round(this.baseMetrics.events + Math.random() * 15 - 3)),
      revenue: Math.max(0, this.baseMetrics.revenue + (Math.random() * 200 - 50)),
      conversions: Math.max(0, Math.round(this.baseMetrics.conversions + Math.random() * 3 - 1)),
      errorRate: Math.max(0, Math.min(5, this.baseMetrics.errorRate + (Math.random() * 0.4 - 0.2))),
      responseTime: Math.max(50, this.baseMetrics.responseTime + (Math.random() * 50 - 25)),
      systemLoad: Math.max(10, Math.min(95, this.baseMetrics.systemLoad + (Math.random() * 10 - 5))),
      timestamp: now
    }

    return { ...this.baseMetrics }
  }

  generateEvent(): DemoEvent {
    const eventTypes = Object.keys(this.actions) as Array<keyof typeof this.actions>
    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const randomAction = this.actions[randomEventType][Math.floor(Math.random() * this.actions[randomEventType].length)]
    const randomPage = this.pages[Math.floor(Math.random() * this.pages.length)]
    const randomLocation = this.locations[Math.floor(Math.random() * this.locations.length)]
    const randomDevice = this.devices[Math.floor(Math.random() * this.devices.length)]
    const randomBrowser = this.browsers[Math.floor(Math.random() * this.browsers.length)]
    const randomReferrer = this.referrers[Math.floor(Math.random() * this.referrers.length)]

    return {
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: randomEventType,
      user: {
        id: `user_${Math.floor(Math.random() * 10000)}`,
        name: this.generateUserName(),
        email: this.generateUserEmail()
      },
      page: randomPage,
      action: randomAction,
      timestamp: Date.now(),
      location: randomLocation,
      metadata: {
        device: randomDevice,
        browser: randomBrowser,
        referrer: randomReferrer === 'direct' ? undefined : randomReferrer,
        sessionDuration: Math.floor(Math.random() * 1800), // 0-30 minutes
        ...this.generateEventSpecificMetadata(randomEventType)
      }
    }
  }

  private generateUserName(): string {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Anna', 'Chris', 'Emily']
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson']
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    return `${firstName} ${lastName}`
  }

  private generateUserEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'example.com']
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const username = `user${Math.floor(Math.random() * 10000)}`
    
    return `${username}@${domain}`
  }

  private generateEventSpecificMetadata(eventType: string): Record<string, any> {
    const metadata: Record<string, any> = {}

    switch (eventType) {
      case 'conversion':
        metadata.plan = ['Starter', 'Professional', 'Enterprise'][Math.floor(Math.random() * 3)]
        metadata.value = Math.floor(Math.random() * 500) + 10
        break
      case 'user_action':
        metadata.elementId = `btn_${Math.random().toString(36).substr(2, 6)}`
        metadata.coordinates = {
          x: Math.floor(Math.random() * 1920),
          y: Math.floor(Math.random() * 1080)
        }
        break
      case 'error':
        metadata.errorCode = Math.floor(Math.random() * 500) + 400
        metadata.stack = 'Error stack trace would be here'
        break
      case 'page_view':
        metadata.loadTime = Math.floor(Math.random() * 3000) + 500 // 500-3500ms
        metadata.previousPage = this.pages[Math.floor(Math.random() * this.pages.length)]
        break
    }

    return metadata
  }

  // Generate historical data for charts
  generateHistoricalData(points: number = 50): Array<{
    timestamp: number
    time: string
    activeUsers: number
    pageViews: number
    events: number
    revenue: number
    responseTime: number
  }> {
    const data = []
    const now = Date.now()
    const interval = 60000 // 1 minute intervals

    for (let i = points - 1; i >= 0; i--) {
      const timestamp = now - (i * interval)
      const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      
      // Generate realistic variations
      const baseActiveUsers = 1000 + Math.sin(i / 10) * 200 // Sine wave for realistic daily patterns
      const variance = Math.random() * 100 - 50
      
      data.push({
        timestamp,
        time,
        activeUsers: Math.max(100, Math.round(baseActiveUsers + variance)),
        pageViews: Math.floor(Math.random() * 100) + 50,
        events: Math.floor(Math.random() * 80) + 30,
        revenue: Math.floor(Math.random() * 1000) + 500,
        responseTime: Math.floor(Math.random() * 200) + 100
      })
    }

    return data
  }
}

// Export singleton instance
export const demoDataGenerator = new DemoDataGenerator()

// Utility function to check if we should use demo data
export function shouldUseDemoData(): boolean {
  // Use demo data in development or when WebSocket isn't available
  return process.env.NODE_ENV === 'development' || 
         typeof window === 'undefined' ||
         !window.WebSocket
}