'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRealtimeAnalytics } from '@/lib/hooks/useRealtimeAnalytics'
import { 
  Activity, 
  User, 
  MousePointer, 
  Eye, 
  ShoppingCart,
  CreditCard,
  Settings,
  LogIn,
  LogOut,
  Search,
  Filter,
  Pause,
  Play,
  Download,
  MapPin,
  Clock,
  Smartphone,
  Monitor,
  Chrome,
  Globe
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface LiveEventFeedProps {
  detailed?: boolean
  maxEvents?: number
}

interface EventFilter {
  type?: string
  user?: string
  page?: string
  timeRange?: 'last_hour' | 'last_day' | 'last_week'
  search?: string
}

export function LiveEventFeed({ detailed = false, maxEvents = 50 }: LiveEventFeedProps) {
  const { data, filterEvents } = useRealtimeAnalytics()
  const [isPaused, setIsPaused] = useState(false)
  const [filter, setFilter] = useState<EventFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Mock event data for demonstration
  const [mockEvents, setMockEvents] = useState([
    {
      id: 'evt_1',
      type: 'page_view',
      user: { id: 'user_1', name: 'John Doe', email: 'john@example.com' },
      page: '/dashboard',
      action: 'visited',
      timestamp: Date.now() - 30000,
      location: { country: 'United States', region: 'California', city: 'San Francisco' },
      metadata: { device: 'desktop', browser: 'Chrome', referrer: 'https://google.com' }
    },
    {
      id: 'evt_2',
      type: 'conversion',
      user: { id: 'user_2', name: 'Jane Smith', email: 'jane@example.com' },
      page: '/pricing',
      action: 'upgraded_to_pro',
      timestamp: Date.now() - 120000,
      location: { country: 'United Kingdom', region: 'England', city: 'London' },
      metadata: { device: 'mobile', browser: 'Safari', plan: 'Professional' }
    },
    {
      id: 'evt_3',
      type: 'user_action',
      user: { id: 'user_3', name: 'Mike Johnson', email: 'mike@example.com' },
      page: '/tools/website-analyzer',
      action: 'ran_analysis',
      timestamp: Date.now() - 45000,
      location: { country: 'Canada', region: 'Ontario', city: 'Toronto' },
      metadata: { device: 'desktop', browser: 'Firefox', url: 'https://example.com' }
    }
  ])

  // Generate new mock events periodically
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      const eventTypes = ['page_view', 'user_action', 'conversion', 'auth', 'error']
      const actions = {
        page_view: ['visited', 'loaded', 'refreshed'],
        user_action: ['clicked', 'searched', 'uploaded', 'downloaded', 'shared'],
        conversion: ['signed_up', 'upgraded', 'purchased', 'subscribed'],
        auth: ['logged_in', 'logged_out', 'password_reset'],
        error: ['404_error', 'api_error', 'timeout']
      }
      const pages = ['/dashboard', '/pricing', '/tools/website-analyzer', '/settings', '/teams']
      const locations = [
        { country: 'United States', region: 'California', city: 'San Francisco' },
        { country: 'United Kingdom', region: 'England', city: 'London' },
        { country: 'Germany', region: 'Berlin', city: 'Berlin' },
        { country: 'Japan', region: 'Tokyo', city: 'Tokyo' },
        { country: 'France', region: 'Île-de-France', city: 'Paris' }
      ]

      const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const randomAction = actions[randomEventType as keyof typeof actions][Math.floor(Math.random() * actions[randomEventType as keyof typeof actions].length)]
      const randomPage = pages[Math.floor(Math.random() * pages.length)]
      const randomLocation = locations[Math.floor(Math.random() * locations.length)]

      const newEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: randomEventType,
        user: {
          id: `user_${Math.floor(Math.random() * 1000)}`,
          name: `User ${Math.floor(Math.random() * 1000)}`,
          email: `user${Math.floor(Math.random() * 1000)}@example.com`
        },
        page: randomPage,
        action: randomAction,
        timestamp: Date.now(),
        location: randomLocation,
        metadata: {
          device: Math.random() > 0.5 ? 'desktop' : 'mobile',
          browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
          referrer: Math.random() > 0.5 ? 'direct' : 'search'
        }
      }

      setMockEvents(prev => [newEvent, ...prev.slice(0, maxEvents - 1)])
    }, Math.random() * 3000 + 2000) // 2-5 seconds

    return () => clearInterval(interval)
  }, [isPaused, maxEvents])

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
    }
  }, [mockEvents, autoScroll])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return <Eye className="h-4 w-4" />
      case 'user_action':
        return <MousePointer className="h-4 w-4" />
      case 'conversion':
        return <CreditCard className="h-4 w-4" />
      case 'auth':
        return <User className="h-4 w-4" />
      case 'error':
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'page_view':
        return 'text-blue-600 bg-blue-100'
      case 'user_action':
        return 'text-purple-600 bg-purple-100'
      case 'conversion':
        return 'text-green-600 bg-green-100'
      case 'auth':
        return 'text-orange-600 bg-orange-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getDeviceIcon = (device: string) => {
    return device === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />
  }

  const filteredEvents = mockEvents.filter(event => {
    if (selectedEventType !== 'all' && event.type !== selectedEventType) return false
    if (searchTerm && !event.action.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !event.page.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const exportEvents = () => {
    const csv = [
      ['Timestamp', 'Type', 'Action', 'User', 'Page', 'Location', 'Device', 'Browser'].join(','),
      ...filteredEvents.map(event => [
        format(event.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        event.type,
        event.action,
        event.user?.name || 'Anonymous',
        event.page,
        `${event.location?.city}, ${event.location?.country}`,
        event.metadata?.device || 'unknown',
        event.metadata?.browser || 'unknown'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `events_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Live Event Feed</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredEvents.length} events
            </Badge>
            {!isPaused && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPaused ? 'default' : 'outline'}
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1"
            >
              {isPaused ? (
                <>
                  <Play className="h-3 w-3" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportEvents}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>
          
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="page_view">Page Views</SelectItem>
              <SelectItem value="user_action">User Actions</SelectItem>
              <SelectItem value="conversion">Conversions</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "flex items-center gap-1",
              autoScroll && "bg-blue-50 text-blue-600"
            )}
          >
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Event Feed */}
        <ScrollArea className="h-96" ref={scrollAreaRef}>
          <div className="space-y-3">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-300",
                  index === 0 && !isPaused ? "border-blue-200 bg-blue-50" : "bg-white hover:bg-gray-50"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Event Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    getEventColor(event.type)
                  )}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {event.user?.name || 'Anonymous User'} {event.action.replace('_', ' ')}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(event.timestamp)} ago
                      </p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.page}
                    </p>
                    
                    {detailed && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location?.city}, {event.location?.country}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(event.metadata?.device || 'desktop')}
                          <span>{event.metadata?.device}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{event.metadata?.browser}</span>
                        </div>
                        {event.metadata?.referrer && (
                          <div className="flex items-center gap-1">
                            <span>via {event.metadata.referrer}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {event.metadata?.plan && (
                      <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                        {event.metadata.plan} Plan
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No events match your filters</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Showing {filteredEvents.length} of {mockEvents.length} events</span>
            <span>Update rate: {isPaused ? 'Paused' : '2-5s'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formatDistanceToNow(Date.now())} ago</span>
          </div>
        </div>
      </div>
    </Card>
  )
}