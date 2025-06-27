'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtimeAnalytics } from '@/lib/hooks/useRealtimeAnalytics'
import { 
  Globe, 
  Users, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Tablet,
  Chrome,
  RefreshCw,
  TrendingUp,
  Activity
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface LocationData {
  country: string
  region: string
  city: string
  users: number
  coordinates: [number, number]
  growth: number
}

interface DeviceData {
  type: 'desktop' | 'mobile' | 'tablet'
  count: number
  percentage: number
}

interface BrowserData {
  browser: string
  count: number
  percentage: number
  icon: any
}

export function ActiveUsersMap() {
  const { data, isConnected } = useRealtimeAnalytics()
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  
  // Mock location data - in production, this would come from real user data
  const [locationData, setLocationData] = useState<LocationData[]>([
    { country: 'United States', region: 'California', city: 'San Francisco', users: 245, coordinates: [-122.4194, 37.7749], growth: 12.5 },
    { country: 'United States', region: 'New York', city: 'New York', users: 189, coordinates: [-74.0060, 40.7128], growth: 8.3 },
    { country: 'United Kingdom', region: 'England', city: 'London', users: 156, coordinates: [-0.1276, 51.5074], growth: 15.2 },
    { country: 'Germany', region: 'Berlin', city: 'Berlin', users: 98, coordinates: [13.4050, 52.5200], growth: 6.8 },
    { country: 'France', region: 'Île-de-France', city: 'Paris', users: 87, coordinates: [2.3522, 48.8566], growth: 9.1 },
    { country: 'Japan', region: 'Tokyo', city: 'Tokyo', users: 134, coordinates: [139.6503, 35.6762], growth: 18.7 },
    { country: 'Canada', region: 'Ontario', city: 'Toronto', users: 76, coordinates: [-79.3832, 43.6532], growth: 11.4 },
    { country: 'Australia', region: 'New South Wales', city: 'Sydney', users: 65, coordinates: [151.2093, -33.8688], growth: 7.9 },
    { country: 'Brazil', region: 'São Paulo', city: 'São Paulo', users: 54, coordinates: [-46.6333, -23.5505], growth: 22.1 },
    { country: 'India', region: 'Maharashtra', city: 'Mumbai', users: 92, coordinates: [72.8777, 19.0760], growth: 28.3 }
  ])

  // Mock device data
  const deviceData: DeviceData[] = useMemo(() => {
    const total = data.metrics?.activeUsers || 1000
    return [
      { type: 'desktop', count: Math.round(total * 0.45), percentage: 45 },
      { type: 'mobile', count: Math.round(total * 0.42), percentage: 42 },
      { type: 'tablet', count: Math.round(total * 0.13), percentage: 13 }
    ]
  }, [data.metrics?.activeUsers])

  // Mock browser data
  const browserData: BrowserData[] = useMemo(() => {
    const total = data.metrics?.activeUsers || 1000
    return [
      { browser: 'Chrome', count: Math.round(total * 0.68), percentage: 68, icon: Chrome },
      { browser: 'Safari', count: Math.round(total * 0.19), percentage: 19, icon: Globe },
      { browser: 'Firefox', count: Math.round(total * 0.08), percentage: 8, icon: Globe },
      { browser: 'Edge', count: Math.round(total * 0.05), percentage: 5, icon: Globe }
    ]
  }, [data.metrics?.activeUsers])

  // Update location data with real-time changes
  useEffect(() => {
    const interval = setInterval(() => {
      setLocationData(prev => prev.map(location => ({
        ...location,
        users: Math.max(1, location.users + Math.floor(Math.random() * 10 - 5)),
        growth: Math.random() * 40 - 20 // -20% to +20%
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const totalUsers = locationData.reduce((sum, location) => sum + location.users, 0)

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 10) return 'text-green-600'
    if (growth > 0) return 'text-green-500'
    if (growth > -10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLocationSize = (users: number) => {
    const maxUsers = Math.max(...locationData.map(l => l.users))
    const minSize = 4
    const maxSize = 12
    return minSize + ((users / maxUsers) * (maxSize - minSize))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Active Users Worldwide</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {totalUsers.toLocaleString()} users
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
          >
            <Globe className="h-3 w-3 mr-1" />
            Map
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <Users className="h-3 w-3 mr-1" />
            List
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Map/List View */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {viewMode === 'map' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Geographic Distribution</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>Live updates</span>
                  </div>
                </div>
                
                {/* Simplified World Map Visualization */}
                <div className="h-80 bg-gradient-to-b from-blue-50 to-green-50 rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-100 opacity-20"></div>
                  
                  {/* Continents (simplified representation) */}
                  <div className="relative h-full flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700">
                        Interactive World Map
                      </p>
                      <p className="text-sm text-gray-500">
                        Real-time user activity across {locationData.length} locations
                      </p>
                    </div>
                  </div>
                  
                  {/* Location dots overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {locationData.map((location, index) => {
                      const size = getLocationSize(location.users)
                      const left = 20 + (index % 4) * 20 // Simplified positioning
                      const top = 20 + Math.floor(index / 4) * 20
                      
                      return (
                        <div
                          key={location.city}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                          style={{ left: `${left}%`, top: `${top}%` }}
                          onClick={() => setSelectedCountry(location.country)}
                        >
                          <div 
                            className="bg-blue-600 rounded-full animate-pulse hover:bg-blue-700 transition-colors"
                            style={{ width: size, height: size }}
                            title={`${location.city}, ${location.country}: ${location.users} users`}
                          >
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Map Legend */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Active Users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span>High Activity</span>
                    </div>
                  </div>
                  <span>Size indicates user count</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium">Top Locations</h4>
                <div className="space-y-3">
                  {locationData
                    .sort((a, b) => b.users - a.users)
                    .map((location, index) => (
                    <div key={location.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{location.city}</p>
                          <p className="text-sm text-muted-foreground">{location.country}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{location.users.toLocaleString()}</p>
                        <p className={`text-sm ${getGrowthColor(location.growth)}`}>
                          {location.growth > 0 ? '+' : ''}{location.growth.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <Card className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Device Types
              </h4>
              <div className="space-y-3">
                {deviceData.map((device) => (
                  <div key={device.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.type)}
                      <span className="text-sm font-medium capitalize">{device.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{device.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{device.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Browser Breakdown */}
          <Card className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Browsers
              </h4>
              <div className="space-y-3">
                {browserData.map((browser) => {
                  const IconComponent = browser.icon
                  return (
                    <div key={browser.browser} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{browser.browser}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{browser.count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{browser.percentage}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Real-time Stats */}
          <Card className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Live Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Active</span>
                  <span className="font-medium">{totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Countries</span>
                  <span className="font-medium">{new Set(locationData.map(l => l.country)).size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cities</span>
                  <span className="font-medium">{locationData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Update</span>
                  <span className="font-medium text-green-600">
                    {data.lastUpdated ? formatDistanceToNow(data.lastUpdated) : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}