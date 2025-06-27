'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Users, 
  Eye, 
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MousePointer,
  Navigation
} from 'lucide-react'

interface RealtimeEvent {
  id: string
  timestamp: string
  type: 'pageview' | 'signup' | 'conversion' | 'error'
  user: string
  page: string
  country: string
  device: string
}

export function RealtimeAnalytics() {
  const [currentUsers, setCurrentUsers] = useState(1423)
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'pageview',
      user: 'Anonymous',
      page: '/dashboard',
      country: 'United States',
      device: 'Desktop'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      type: 'signup',
      user: 'user_12345',
      page: '/signup',
      country: 'Canada',
      device: 'Mobile'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      type: 'conversion',
      user: 'user_67890',
      page: '/pricing',
      country: 'United Kingdom',
      device: 'Desktop'
    }
  ])

  const [activePages, setActivePages] = useState([
    { page: '/', users: 234, views: 445 },
    { page: '/dashboard', users: 189, views: 312 },
    { page: '/tools/website-analyzer', users: 156, views: 298 },
    { page: '/teams', users: 98, views: 187 },
    { page: '/pricing', users: 76, views: 143 }
  ])

  const [deviceBreakdown, setDeviceBreakdown] = useState([
    { device: 'Desktop', users: 856, percentage: 60.2 },
    { device: 'Mobile', users: 412, percentage: 28.9 },
    { device: 'Tablet', users: 155, percentage: 10.9 }
  ])

  const [topCountries, setTopCountries] = useState([
    { country: 'United States', users: 567, flag: '🇺🇸' },
    { country: 'United Kingdom', users: 234, flag: '🇬🇧' },
    { country: 'Canada', users: 189, flag: '🇨🇦' },
    { country: 'Australia', users: 156, flag: '🇦🇺' },
    { country: 'Germany', users: 123, flag: '🇩🇪' }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setCurrentUsers(prev => prev + Math.floor(Math.random() * 20) - 10)
      
      // Add new random event
      const eventTypes: RealtimeEvent['type'][] = ['pageview', 'signup', 'conversion', 'error']
      const pages = ['/', '/dashboard', '/tools/website-analyzer', '/teams', '/pricing']
      const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany']
      const devices = ['Desktop', 'Mobile', 'Tablet']
      
      const newEvent: RealtimeEvent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        user: Math.random() > 0.5 ? 'Anonymous' : `user_${Math.random().toString(36).substr(2, 9)}`,
        page: pages[Math.floor(Math.random() * pages.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        device: devices[Math.floor(Math.random() * devices.length)]
      }
      
      setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 9)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getEventIcon = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'pageview':
        return <Eye className="w-4 h-4 text-blue-600" />
      case 'signup':
        return <Users className="w-4 h-4 text-green-600" />
      case 'conversion':
        return <MousePointer className="w-4 h-4 text-purple-600" />
      case 'error':
        return <Activity className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getEventColor = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'pageview':
        return 'bg-blue-100 text-blue-800'
      case 'signup':
        return 'bg-green-100 text-green-800'
      case 'conversion':
        return 'bg-purple-100 text-purple-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`
    return `${Math.floor(diffSecs / 3600)}h ago`
  }

  return (
    <div className="space-y-8">
      {/* Real-time Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{currentUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Page Views/min</p>
              <p className="text-2xl font-bold">247</p>
              <p className="text-xs text-blue-600">+12% vs avg</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Session</p>
              <p className="text-2xl font-bold">4m 32s</p>
              <p className="text-xs text-purple-600">Current average</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
              <p className="text-2xl font-bold">28.4%</p>
              <p className="text-xs text-orange-600">Real-time</p>
            </div>
            <Navigation className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Real-time Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">Live</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {realtimeEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getEventIcon(event.type)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{event.user}</span>
                    <Badge className={getEventColor(event.type)} variant="secondary">
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{event.page}</span>
                    <span>•</span>
                    <span>{event.country}</span>
                    <span>•</span>
                    <span>{event.device}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Real-time Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Pages</h3>
          <div className="space-y-4">
            {activePages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{page.page}</p>
                  <p className="text-xs text-gray-500">{page.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{page.users} users</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {deviceBreakdown.map((device) => (
              <div key={device.device} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(device.device)}
                  <span className="font-medium text-sm">{device.device}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{device.users} users</p>
                  <p className="text-xs text-gray-500">{device.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Countries (Live)</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {topCountries.map((country) => (
            <div key={country.country} className="flex items-center space-x-3 p-3 border rounded-lg">
              <span className="text-2xl">{country.flag}</span>
              <div>
                <p className="font-medium text-sm">{country.country}</p>
                <p className="text-xs text-gray-500">{country.users} active users</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Real-time Heatmap Placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Real-time User Heatmap</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Real-time user activity heatmap would appear here</p>
            <p className="text-sm text-gray-400">Showing {currentUsers} active users worldwide</p>
          </div>
        </div>
      </Card>
    </div>
  )
}