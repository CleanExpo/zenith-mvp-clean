'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  X,
  Volume2,
  VolumeX
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface AlertRule {
  id: string
  name: string
  metric: string
  operator: 'gt' | 'lt' | 'eq'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  channels: ('email' | 'sms' | 'slack' | 'webhook')[]
}

interface Alert {
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  acknowledged: boolean
  resolved: boolean
  ruleId?: string
}

interface AlertsNotificationsProps {
  expanded?: boolean
}

export function AlertsNotifications({ expanded = false }: AlertsNotificationsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert_1',
      title: 'High Error Rate Detected',
      message: 'Error rate has exceeded 5% threshold (current: 7.2%)',
      severity: 'high',
      timestamp: Date.now() - 300000, // 5 minutes ago
      acknowledged: false,
      resolved: false,
      ruleId: 'rule_error_rate'
    },
    {
      id: 'alert_2',
      title: 'Response Time Spike',
      message: 'Average response time is 2.3s (threshold: 1s)',
      severity: 'medium',
      timestamp: Date.now() - 600000, // 10 minutes ago
      acknowledged: true,
      resolved: false,
      ruleId: 'rule_response_time'
    },
    {
      id: 'alert_3',
      title: 'Memory Usage Critical',
      message: 'Memory usage at 95% (threshold: 90%)',
      severity: 'critical',
      timestamp: Date.now() - 120000, // 2 minutes ago
      acknowledged: false,
      resolved: false,
      ruleId: 'rule_memory'
    }
  ])

  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'rule_error_rate',
      name: 'High Error Rate',
      metric: 'error_rate',
      operator: 'gt',
      threshold: 5,
      severity: 'high',
      enabled: true,
      channels: ['email', 'slack']
    },
    {
      id: 'rule_response_time',
      name: 'Slow Response Time',
      metric: 'response_time',
      operator: 'gt',
      threshold: 1000,
      severity: 'medium',
      enabled: true,
      channels: ['email']
    },
    {
      id: 'rule_memory',
      name: 'High Memory Usage',
      metric: 'memory_usage',
      operator: 'gt',
      threshold: 90,
      severity: 'critical',
      enabled: true,
      channels: ['email', 'sms', 'slack']
    },
    {
      id: 'rule_cpu',
      name: 'High CPU Usage',
      metric: 'cpu_usage',
      operator: 'gt',
      threshold: 85,
      severity: 'medium',
      enabled: false,
      channels: ['email']
    }
  ])

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newRuleName, setNewRuleName] = useState('')
  const [showNewRuleForm, setShowNewRuleForm] = useState(false)

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged && !alert.resolved)
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved)

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const severities: Alert['severity'][] = ['low', 'medium', 'high', 'critical']
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)]
        
        const newAlert: Alert = {
          id: `alert_${Date.now()}`,
          title: `System Alert - ${randomSeverity.toUpperCase()}`,
          message: `Automated alert triggered at ${new Date().toLocaleTimeString()}`,
          severity: randomSeverity,
          timestamp: Date.now(),
          acknowledged: false,
          resolved: false
        }
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 19)]) // Keep max 20 alerts
        
        // Play notification sound
        if (soundEnabled && randomSeverity !== 'low') {
          // In a real app, play notification sound
          console.log('🔔 Alert notification sound')
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [soundEnabled])

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true, acknowledged: true } : alert
    ))
  }

  const toggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-3 w-3" />
      case 'sms':
        return <Smartphone className="h-3 w-3" />
      case 'slack':
        return <MessageSquare className="h-3 w-3" />
      default:
        return <Bell className="h-3 w-3" />
    }
  }

  if (!expanded) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative flex items-center gap-1">
            {unacknowledgedAlerts.length > 0 ? (
              <BellRing className="h-3 w-3 text-red-600" />
            ) : (
              <Bell className="h-3 w-3" />
            )}
            Alerts
            {unacknowledgedAlerts.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Real-time Alerts</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-96">
            <div className="p-2">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border mb-2 transition-all",
                    getSeverityColor(alert.severity),
                    alert.acknowledged && "opacity-60",
                    alert.resolved && "opacity-40"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{alert.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(alert.timestamp)} ago
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                      
                      {!alert.acknowledged && !alert.resolved && (
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="h-6 text-xs"
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                            className="h-6 text-xs"
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No alerts</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold">{criticalAlerts.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Unacknowledged</p>
              <p className="text-2xl font-bold">{unacknowledgedAlerts.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Rules</p>
              <p className="text-2xl font-bold">{alertRules.filter(r => r.enabled).length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              <p className="text-2xl font-bold">{alerts.filter(a => a.resolved).length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Recent Alerts</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1"
              >
                {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                Sound {soundEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    getSeverityColor(alert.severity),
                    alert.acknowledged && "opacity-60",
                    alert.resolved && "opacity-40"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(alert.timestamp)} ago
                      </p>
                      
                      {!alert.acknowledged && !alert.resolved && (
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="h-6 text-xs"
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                            className="h-6 text-xs"
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Alert Rules Configuration */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Alert Rules</h3>
            <Button
              size="sm"
              onClick={() => setShowNewRuleForm(!showNewRuleForm)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Rule
            </Button>
          </div>
          
          {showNewRuleForm && (
            <Card className="p-3 mb-4 bg-gray-50">
              <div className="space-y-3">
                <Input
                  placeholder="Rule name"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" disabled={!newRuleName}>
                    Create Rule
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewRuleForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          <div className="space-y-3">
            {alertRules.map((rule) => (
              <div key={rule.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{rule.name}</p>
                      <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rule.metric} {rule.operator} {rule.threshold}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {rule.channels.map((channel) => (
                        <div key={channel} className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getChannelIcon(channel)}
                          <span>{channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}