'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock, 
  User, 
  Code, 
  Globe,
  TrendingUp,
  TrendingDown,
  Activity,
  Bug,
  Zap,
  Filter
} from 'lucide-react'

interface ErrorEvent {
  id: string
  timestamp: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  stack: string
  file: string
  line: number
  user?: string
  browser?: string
  url: string
  count: number
  status: 'open' | 'resolved' | 'ignored'
  tags: string[]
}

interface ErrorTrend {
  timestamp: string
  count: number
  severity: 'critical' | 'warning' | 'info'
}

interface ErrorTrackingDashboardProps {
  searchTerm?: string
  severityFilter?: string
  timeFilter?: string
}

export function ErrorTrackingDashboard({ 
  searchTerm = '', 
  severityFilter = 'all',
  timeFilter = '24h'
}: ErrorTrackingDashboardProps) {
  const [errors, setErrors] = useState<ErrorEvent[]>([
    {
      id: 'err_001',
      timestamp: '2025-06-27T10:30:00Z',
      severity: 'critical',
      message: 'Database connection timeout',
      stack: 'Error: Connection timeout\n  at Database.connect (/app/lib/database.ts:45)\n  at async handler (/app/api/users/route.ts:12)',
      file: '/app/lib/database.ts',
      line: 45,
      user: 'user_12345',
      browser: 'Chrome 126.0.0.0',
      url: '/api/users',
      count: 12,
      status: 'open',
      tags: ['database', 'timeout', 'api']
    },
    {
      id: 'err_002',
      timestamp: '2025-06-27T10:25:00Z',
      severity: 'warning',
      message: 'Rate limit exceeded for API endpoint',
      stack: 'Error: Rate limit exceeded\n  at rateLimiter (/app/middleware.ts:23)\n  at handler (/app/api/analyze/route.ts:8)',
      file: '/app/middleware.ts',
      line: 23,
      user: 'user_67890',
      browser: 'Firefox 127.0.0',
      url: '/api/analyze',
      count: 45,
      status: 'open',
      tags: ['rate-limit', 'middleware', 'api']
    },
    {
      id: 'err_003',
      timestamp: '2025-06-27T10:20:00Z',
      severity: 'info',
      message: 'Deprecated API endpoint accessed',
      stack: 'Warning: Deprecated endpoint\n  at deprecatedHandler (/app/api/v1/old-endpoint.ts:5)',
      file: '/app/api/v1/old-endpoint.ts',
      line: 5,
      browser: 'Safari 17.5',
      url: '/api/v1/old-endpoint',
      count: 8,
      status: 'ignored',
      tags: ['deprecated', 'api', 'v1']
    },
    {
      id: 'err_004',
      timestamp: '2025-06-27T09:45:00Z',
      severity: 'critical',
      message: 'Stripe webhook signature validation failed',
      stack: 'Error: Invalid webhook signature\n  at validateSignature (/app/api/webhooks/stripe.ts:12)',
      file: '/app/api/webhooks/stripe.ts',
      line: 12,
      url: '/api/webhooks/stripe',
      count: 3,
      status: 'resolved',
      tags: ['stripe', 'webhook', 'security']
    },
    {
      id: 'err_005',
      timestamp: '2025-06-27T09:30:00Z',
      severity: 'warning',
      message: 'High memory usage detected',
      stack: 'Warning: Memory usage at 85%\n  at memoryMonitor (/app/lib/monitoring.ts:34)',
      file: '/app/lib/monitoring.ts',
      line: 34,
      url: '/admin/monitoring',
      count: 1,
      status: 'open',
      tags: ['memory', 'performance', 'monitoring']
    }
  ])

  const [trends, setTrends] = useState<ErrorTrend[]>([
    { timestamp: '10:00', count: 5, severity: 'critical' },
    { timestamp: '11:00', count: 12, severity: 'critical' },
    { timestamp: '12:00', count: 8, severity: 'critical' },
    { timestamp: '13:00', count: 15, severity: 'warning' },
    { timestamp: '14:00', count: 23, severity: 'warning' },
    { timestamp: '15:00', count: 18, severity: 'warning' }
  ])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />
      default:
        return <Bug className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'ignored':
        return <Clock className="w-4 h-4 text-gray-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'ignored':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-orange-100 text-orange-800'
    }
  }

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSeverity = severityFilter === 'all' || error.severity === severityFilter
    
    return matchesSearch && matchesSeverity
  })

  const errorStats = {
    total: errors.length,
    critical: errors.filter(e => e.severity === 'critical').length,
    warning: errors.filter(e => e.severity === 'warning').length,
    info: errors.filter(e => e.severity === 'info').length,
    resolved: errors.filter(e => e.status === 'resolved').length,
    open: errors.filter(e => e.status === 'open').length
  }

  const handleResolveError = (errorId: string) => {
    setErrors(prev => prev.map(error => 
      error.id === errorId ? { ...error, status: 'resolved' as const } : error
    ))
  }

  const handleIgnoreError = (errorId: string) => {
    setErrors(prev => prev.map(error => 
      error.id === errorId ? { ...error, status: 'ignored' as const } : error
    ))
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-8">
      {/* Error Trends Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Trends (Last 24h)</h3>
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Error trend chart would appear here</p>
            <p className="text-sm text-gray-400">
              Current trend: {errorStats.critical > 5 ? '↗️ Increasing' : '↘️ Decreasing'}
            </p>
          </div>
        </div>
      </Card>

      {/* Error Management Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            All ({errorStats.total})
          </TabsTrigger>
          <TabsTrigger value="critical" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Critical ({errorStats.critical})
          </TabsTrigger>
          <TabsTrigger value="open" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Open ({errorStats.open})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resolved ({errorStats.resolved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredErrors.map((error) => (
              <Card key={error.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{error.message}</h3>
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                        <Badge className={getStatusColor(error.status)}>
                          {error.status}
                        </Badge>
                        {error.count > 1 && (
                          <Badge variant="outline">
                            {error.count}x
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center">
                          <Code className="w-3 h-3 mr-1" />
                          {error.file}:{error.line}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(error.timestamp)}
                        </span>
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {error.url}
                        </span>
                        {error.user && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {error.user}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        {error.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <details className="group">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View Stack Trace
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-x-auto">
                          {error.stack}
                        </pre>
                      </details>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {error.status === 'open' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveError(error.id)}
                          className="flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Resolve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIgnoreError(error.id)}
                          className="flex items-center space-x-1"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Ignore</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <div className="space-y-4">
            {filteredErrors.filter(error => error.severity === 'critical').map((error) => (
              <Card key={error.id} className="p-6 border-red-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-red-900">{error.message}</h3>
                        <Badge className="bg-red-100 text-red-800">
                          CRITICAL
                        </Badge>
                        {error.count > 1 && (
                          <Badge variant="destructive">
                            {error.count} occurrences
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-red-700 mb-2">
                        <p>File: {error.file}:{error.line}</p>
                        <p>Time: {formatTimestamp(error.timestamp)}</p>
                        <p>URL: {error.url}</p>
                      </div>

                      <div className="text-xs text-red-600 font-mono bg-red-50 p-2 rounded">
                        {error.stack.split('\n')[0]}
                      </div>
                    </div>
                  </div>

                  {error.status === 'open' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleResolveError(error.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Resolve Critical
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          <div className="space-y-4">
            {filteredErrors.filter(error => error.status === 'open').map((error) => (
              <Card key={error.id} className="p-6 border-orange-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{error.message}</h3>
                      <div className="text-sm text-gray-600">
                        {error.file}:{error.line} • {formatTimestamp(error.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveError(error.id)}
                    >
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIgnoreError(error.id)}
                    >
                      Ignore
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <div className="space-y-4">
            {filteredErrors.filter(error => error.status === 'resolved').map((error) => (
              <Card key={error.id} className="p-6 border-green-200 bg-green-50">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-green-900 mb-2">{error.message}</h3>
                    <div className="text-sm text-green-700">
                      Resolved • {error.file}:{error.line} • {formatTimestamp(error.timestamp)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Error Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Error Sources</h3>
          <div className="space-y-3">
            {[
              { file: '/app/lib/database.ts', count: 23, trend: 'up' },
              { file: '/app/middleware.ts', count: 18, trend: 'down' },
              { file: '/app/api/webhooks/stripe.ts', count: 12, trend: 'stable' },
              { file: '/app/lib/monitoring.ts', count: 8, trend: 'up' }
            ].map((source) => (
              <div key={source.file} className="flex items-center justify-between">
                <span className="text-sm font-mono text-gray-700">{source.file}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{source.count}</span>
                  {source.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-red-500" />
                  ) : source.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-green-500" />
                  ) : (
                    <Activity className="w-3 h-3 text-gray-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Distribution</h3>
          <div className="space-y-3">
            {[
              { browser: 'Chrome', count: 45, percentage: 62 },
              { browser: 'Firefox', count: 18, percentage: 25 },
              { browser: 'Safari', count: 8, percentage: 11 },
              { browser: 'Edge', count: 2, percentage: 3 }
            ].map((browser) => (
              <div key={browser.browser} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{browser.browser}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{browser.count}</span>
                  <span className="text-xs text-gray-500">({browser.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}