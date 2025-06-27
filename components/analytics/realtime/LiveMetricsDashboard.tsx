'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRealtimeAnalytics } from '@/lib/hooks/useRealtimeAnalytics'
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  MousePointer,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function LiveMetricsDashboard() {
  const { data, isConnected, connectionStatus, reconnect } = useRealtimeAnalytics({
    autoConnect: true,
    fallbackToPolling: true
  })

  const [animatingMetrics, setAnimatingMetrics] = useState<Set<string>>(new Set())

  // Animate metrics when they change
  useEffect(() => {
    if (data.metrics) {
      const metricsToAnimate = new Set<string>()
      
      // Add all metrics that might have changed
      Object.keys(data.metrics).forEach(key => {
        metricsToAnimate.add(key)
      })
      
      setAnimatingMetrics(metricsToAnimate)
      
      // Clear animations after a short delay
      const timer = setTimeout(() => {
        setAnimatingMetrics(new Set())
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [data.metrics])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600'
      case 'connecting':
        return 'text-yellow-600'
      case 'disconnected':
        return 'text-red-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4" />
      case 'connecting':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      default:
        return <WifiOff className="h-4 w-4" />
    }
  }

  const metrics = data.metrics

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${getStatusColor(connectionStatus)}`}>
            {getStatusIcon(connectionStatus)}
            <span className="text-sm font-medium capitalize">{connectionStatus}</span>
          </div>
          {data.lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(data.lastUpdated)} ago
            </span>
          )}
        </div>
        
        {!isConnected && (
          <Button
            size="sm"
            variant="outline"
            onClick={reconnect}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Reconnect
          </Button>
        )}
      </div>

      {/* Live Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Users */}
        <Card className={`p-6 transition-all duration-500 ${
          animatingMetrics.has('activeUsers') ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {metrics ? formatNumber(metrics.activeUsers) : '---'}
                </p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 ml-1">Live</span>
                </div>
              </div>
              <p className="text-xs text-green-600">Online now</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        {/* Page Views */}
        <Card className={`p-6 transition-all duration-500 ${
          animatingMetrics.has('pageViews') ? 'ring-2 ring-purple-500 bg-purple-50' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Page Views</p>
              <p className="text-2xl font-bold">
                {metrics ? formatNumber(metrics.pageViews) : '---'}
              </p>
              <p className="text-xs text-purple-600">Last 5 minutes</p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        {/* Events */}
        <Card className={`p-6 transition-all duration-500 ${
          animatingMetrics.has('events') ? 'ring-2 ring-orange-500 bg-orange-50' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Events</p>
              <p className="text-2xl font-bold">
                {metrics ? formatNumber(metrics.events) : '---'}
              </p>
              <p className="text-xs text-orange-600">User interactions</p>
            </div>
            <MousePointer className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        {/* Revenue */}
        <Card className={`p-6 transition-all duration-500 ${
          animatingMetrics.has('revenue') ? 'ring-2 ring-green-500 bg-green-50' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">
                {metrics ? formatCurrency(metrics.revenue) : '---'}
              </p>
              <p className="text-xs text-green-600">Last hour</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Conversions */}
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="text-lg font-semibold">
                {metrics ? metrics.conversions : '---'}
              </p>
            </div>
          </div>
        </Card>

        {/* Response Time */}
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Response Time</p>
              <p className="text-lg font-semibold">
                {metrics ? `${Math.round(metrics.responseTime)}ms` : '---'}
              </p>
            </div>
          </div>
        </Card>

        {/* Error Rate */}
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Error Rate</p>
              <p className="text-lg font-semibold">
                {metrics ? `${metrics.errorRate.toFixed(2)}%` : '---'}
              </p>
            </div>
          </div>
        </Card>

        {/* System Load */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">System Load</p>
              <span className="text-sm font-medium">
                {metrics ? `${Math.round(metrics.systemLoad)}%` : '---'}
              </span>
            </div>
            <Progress 
              value={metrics?.systemLoad || 0} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Alerts */}
      {data.alerts.length > 0 && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Active Alerts</h3>
            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
              {data.alerts.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {data.alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <Badge 
                  variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {alert.severity}
                </Badge>
              </div>
            ))}
            {data.alerts.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{data.alerts.length - 3} more alerts
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}