'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe
} from 'lucide-react'

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  icon: React.ComponentType<any>
}

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'outage'
  uptime: number
  responseTime: number
  lastChecked: string
}

export function ProductionMonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 34,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      icon: Cpu
    },
    {
      name: 'Memory Usage',
      value: 67,
      unit: '%',
      status: 'warning',
      trend: 'up',
      icon: MemoryStick
    },
    {
      name: 'Disk Usage',
      value: 23,
      unit: '%',
      status: 'healthy',
      trend: 'down',
      icon: HardDrive
    },
    {
      name: 'Response Time',
      value: 142,
      unit: 'ms',
      status: 'healthy',
      trend: 'stable',
      icon: Clock
    },
    {
      name: 'Active Users',
      value: 1423,
      unit: '',
      status: 'healthy',
      trend: 'up',
      icon: Users
    },
    {
      name: 'Database Connections',
      value: 23,
      unit: '/100',
      status: 'healthy',
      trend: 'stable',
      icon: Database
    }
  ])

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Web Application',
      status: 'operational',
      uptime: 99.97,
      responseTime: 142,
      lastChecked: '30 seconds ago'
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: 99.99,
      responseTime: 12,
      lastChecked: '1 minute ago'
    },
    {
      name: 'Redis Cache',
      status: 'operational',
      uptime: 99.95,
      responseTime: 2,
      lastChecked: '30 seconds ago'
    },
    {
      name: 'Authentication Service',
      status: 'operational',
      uptime: 99.98,
      responseTime: 87,
      lastChecked: '45 seconds ago'
    },
    {
      name: 'Email Service',
      status: 'degraded',
      uptime: 98.12,
      responseTime: 1200,
      lastChecked: '2 minutes ago'
    },
    {
      name: 'Payment Gateway',
      status: 'operational',
      uptime: 99.94,
      responseTime: 234,
      lastChecked: '1 minute ago'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600'
      case 'critical':
      case 'outage':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'bg-green-100 text-green-800'
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
      case 'outage':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'critical':
      case 'outage':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600" />
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-600" />
      default:
        return <Activity className="w-3 h-3 text-gray-600" />
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10)
      })))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const IconComponent = metric.icon
          return (
            <Card key={metric.name} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    metric.status === 'healthy' ? 'bg-green-100' :
                    metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${getStatusColor(metric.status)}`} />
                  </div>
                  <h3 className="font-medium text-gray-900">{metric.name}</h3>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.name === 'Active Users' ? metric.value.toLocaleString() : 
                     Math.round(metric.value)}
                  </span>
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                </div>
                
                {metric.unit === '%' && (
                  <Progress 
                    value={metric.value} 
                    className={`h-2 ${
                      metric.status === 'healthy' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}
                  />
                )}
                
                <Badge className={getStatusBadgeColor(metric.status)}>
                  {metric.status.toUpperCase()}
                </Badge>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Service Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Service Status</h2>
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
        </div>
        
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                {getStatusIcon(service.status)}
                <div>
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">Last checked: {service.lastChecked}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{service.uptime}%</p>
                  <p className="text-xs text-gray-500">Uptime</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{service.responseTime}ms</p>
                  <p className="text-xs text-gray-500">Response</p>
                </div>
                <Badge className={getStatusBadgeColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Response time chart would appear here</p>
              <p className="text-sm text-gray-400">Average: 142ms (Last 24h)</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic & Load</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Traffic analytics chart would appear here</p>
              <p className="text-sm text-gray-400">Current: 1,423 active users</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Infrastructure Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Infrastructure Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Server className="w-4 h-4 mr-2" />
              Servers
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Web Servers</span>
                <span className="text-sm font-medium text-green-600">3/3 Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">API Servers</span>
                <span className="text-sm font-medium text-green-600">5/5 Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Worker Nodes</span>
                <span className="text-sm font-medium text-green-600">4/4 Online</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Databases
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Primary DB</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Read Replicas</span>
                <span className="text-sm font-medium text-green-600">2/2 Synced</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cache Layer</span>
                <span className="text-sm font-medium text-green-600">Redis Online</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              External Services
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CDN</span>
                <span className="text-sm font-medium text-green-600">All Edges</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">DNS</span>
                <span className="text-sm font-medium text-green-600">Resolving</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">SSL Cert</span>
                <span className="text-sm font-medium text-green-600">Valid (89d)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Events */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Events</h2>
        
        <div className="space-y-4">
          {[
            {
              time: '2 minutes ago',
              type: 'info',
              message: 'Auto-scaling triggered: Added 2 additional worker nodes'
            },
            {
              time: '15 minutes ago',
              type: 'warning',
              message: 'High memory usage detected on server web-03'
            },
            {
              time: '1 hour ago',
              type: 'success',
              message: 'Database backup completed successfully'
            },
            {
              time: '3 hours ago',
              type: 'info',
              message: 'Deployed version 2.1.3 to production'
            },
            {
              time: '6 hours ago',
              type: 'success',
              message: 'SSL certificate renewed automatically'
            }
          ].map((event, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                event.type === 'success' ? 'bg-green-500' :
                event.type === 'warning' ? 'bg-yellow-500' :
                event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{event.message}</p>
                <p className="text-xs text-gray-500">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}