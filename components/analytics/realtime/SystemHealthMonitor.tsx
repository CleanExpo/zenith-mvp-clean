'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtimeAnalytics } from '@/lib/hooks/useRealtimeAnalytics'
import { 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Shield,
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'

interface SystemMetrics {
  uptime: number
  responseTime: number
  errorRate: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
  activeConnections: number
  requestsPerSecond: number
  databaseConnections: number
  cacheHitRate: number
  queueLength: number
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'down'
  responseTime: number
  uptime: number
  lastCheck: number
  message?: string
}

export function SystemHealthMonitor() {
  const { data } = useRealtimeAnalytics()
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.9,
    responseTime: 145,
    errorRate: 0.02,
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 32,
    networkLatency: 23,
    activeConnections: 1247,
    requestsPerSecond: 156,
    databaseConnections: 89,
    cacheHitRate: 94.7,
    queueLength: 12
  })

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Web Server',
      status: 'healthy',
      responseTime: 125,
      uptime: 99.9,
      lastCheck: Date.now()
    },
    {
      name: 'Database',
      status: 'healthy',
      responseTime: 45,
      uptime: 99.8,
      lastCheck: Date.now()
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      responseTime: 12,
      uptime: 100,
      lastCheck: Date.now()
    },
    {
      name: 'API Gateway',
      status: 'warning',
      responseTime: 234,
      uptime: 99.5,
      lastCheck: Date.now(),
      message: 'Elevated response times detected'
    },
    {
      name: 'CDN',
      status: 'healthy',
      responseTime: 67,
      uptime: 99.9,
      lastCheck: Date.now()
    },
    {
      name: 'Email Service',
      status: 'healthy',
      responseTime: 890,
      uptime: 99.7,
      lastCheck: Date.now()
    }
  ])

  const [performanceHistory, setPerformanceHistory] = useState<Array<{
    timestamp: number
    time: string
    responseTime: number
    cpuUsage: number
    memoryUsage: number
    errorRate: number
  }>>([])

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.max(50, prev.responseTime + (Math.random() - 0.5) * 30),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.1)),
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        diskUsage: Math.max(20, Math.min(80, prev.diskUsage + (Math.random() - 0.5) * 2)),
        networkLatency: Math.max(5, prev.networkLatency + (Math.random() - 0.5) * 10),
        activeConnections: Math.max(100, prev.activeConnections + Math.floor((Math.random() - 0.5) * 50)),
        requestsPerSecond: Math.max(50, prev.requestsPerSecond + Math.floor((Math.random() - 0.5) * 30)),
        databaseConnections: Math.max(20, Math.min(200, prev.databaseConnections + Math.floor((Math.random() - 0.5) * 10))),
        cacheHitRate: Math.max(80, Math.min(100, prev.cacheHitRate + (Math.random() - 0.5) * 2)),
        queueLength: Math.max(0, prev.queueLength + Math.floor((Math.random() - 0.5) * 8))
      }))

      // Update performance history
      const now = Date.now()
      setPerformanceHistory(prev => {
        const newPoint = {
          timestamp: now,
          time: format(now, 'HH:mm:ss'),
          responseTime: metrics.responseTime,
          cpuUsage: metrics.cpuUsage,
          memoryUsage: metrics.memoryUsage,
          errorRate: metrics.errorRate
        }
        return [...prev, newPoint].slice(-50) // Keep last 50 points
      })

      // Update service statuses
      setServices(prev => prev.map(service => {
        const variation = Math.random()
        let newStatus = service.status
        
        if (variation < 0.1) {
          newStatus = service.status === 'healthy' ? 'warning' : 'healthy'
        }
        
        return {
          ...service,
          status: newStatus,
          responseTime: Math.max(10, service.responseTime + (Math.random() - 0.5) * 50),
          lastCheck: now
        }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [metrics.responseTime, metrics.cpuUsage, metrics.memoryUsage, metrics.errorRate])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'down':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'down':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'bg-green-500'
    if (value < thresholds[1]) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' : 
                      services.some(s => s.status === 'critical' || s.status === 'down') ? 'critical' : 'warning'

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card className={`p-6 ${
        overallHealth === 'healthy' ? 'border-green-200 bg-green-50' :
        overallHealth === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(overallHealth)}
            <div>
              <h3 className="text-lg font-semibold">System Health</h3>
              <p className="text-sm text-muted-foreground">
                Overall system status: <span className="font-medium capitalize">{overallHealth}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{metrics.uptime.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold">{Math.round(metrics.responseTime)}ms</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metrics.responseTime < 200 ? 
                      <TrendingDown className="h-3 w-3 text-green-600" /> :
                      <TrendingUp className="h-3 w-3 text-red-600" />
                    }
                    <span className={`text-xs ${
                      metrics.responseTime < 200 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.responseTime < 200 ? 'Good' : 'Slow'}
                    </span>
                  </div>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metrics.errorRate < 1 ? 
                      <CheckCircle className="h-3 w-3 text-green-600" /> :
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                    }
                    <span className={`text-xs ${
                      metrics.errorRate < 1 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrics.errorRate < 1 ? 'Low' : 'High'}
                    </span>
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                  <p className="text-2xl font-bold">{metrics.activeConnections.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Live sessions</p>
                </div>
                <Wifi className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Requests/sec</p>
                  <p className="text-2xl font-bold">{metrics.requestsPerSecond}</p>
                  <p className="text-xs text-muted-foreground mt-1">Current load</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* Resource Usage */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">CPU Usage</span>
                  </div>
                  <span className="text-sm font-medium">{Math.round(metrics.cpuUsage)}%</span>
                </div>
                <Progress 
                  value={metrics.cpuUsage} 
                  className={`h-2 ${getProgressColor(metrics.cpuUsage, [60, 80])}`}
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Memory Usage</span>
                  </div>
                  <span className="text-sm font-medium">{Math.round(metrics.memoryUsage)}%</span>
                </div>
                <Progress 
                  value={metrics.memoryUsage} 
                  className={`h-2 ${getProgressColor(metrics.memoryUsage, [70, 85])}`}
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Disk Usage</span>
                  </div>
                  <span className="text-sm font-medium">{Math.round(metrics.diskUsage)}%</span>
                </div>
                <Progress 
                  value={metrics.diskUsage} 
                  className={`h-2 ${getProgressColor(metrics.diskUsage, [70, 90])}`}
                />
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h4 className="font-medium mb-4">Performance Trends</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpuUsage" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="CPU Usage (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memoryUsage" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Memory Usage (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.message && (
                        <p className="text-sm text-muted-foreground">{service.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{Math.round(service.responseTime)}ms</p>
                      <p className="text-xs text-muted-foreground">Response time</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{service.uptime.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Uptime</p>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Connections</span>
                  <span className="font-medium">{metrics.databaseConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Query Time</span>
                  <span className="font-medium">{Math.round(metrics.responseTime / 3)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                  <span className="font-medium">{metrics.cacheHitRate.toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Network Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <span className="font-medium">{Math.round(metrics.networkLatency)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bandwidth Usage</span>
                  <span className="font-medium">245 MB/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Queue Length</span>
                  <span className="font-medium">{metrics.queueLength}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}