'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  Filter,
  Download,
  Eye,
  RotateCcw,
  Trash2,
  Zap
} from 'lucide-react'

interface WebhookEvent {
  id: string
  type: string
  status: 'pending' | 'processed' | 'failed'
  payload: any
  error?: string
  createdAt: string
  processedAt?: string
}

interface WebhookStats {
  total: number
  processed: number
  failed: number
  pending: number
  successRate: string
}

export function WebhookMonitor() {
  const { user } = useAuth()
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [stats, setStats] = useState<WebhookStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadWebhookEvents()
  }, [statusFilter, typeFilter])

  const loadWebhookEvents = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)

      const response = await fetch(`/api/admin/webhooks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading webhook events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventAction = async (eventId: string, action: 'retry' | 'mark_processed' | 'delete') => {
    setProcessing(eventId)
    try {
      const response = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, eventId })
      })

      if (response.ok) {
        await loadWebhookEvents()
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error(`Error ${action}ing webhook event:`, error)
    } finally {
      setProcessing(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      processed: 'default',
      failed: 'destructive',
      pending: 'secondary'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  const formatEventType = (type: string) => {
    return type.split('.').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Webhook Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processed</p>
                  <p className="text-2xl font-bold">{stats.processed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Webhook Events */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Webhook Events
              </CardTitle>
              <CardDescription>
                Monitor and manage Stripe webhook events
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadWebhookEvents}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer.subscription.created">Subscription Created</SelectItem>
                <SelectItem value="customer.subscription.updated">Subscription Updated</SelectItem>
                <SelectItem value="invoice.payment_succeeded">Payment Succeeded</SelectItem>
                <SelectItem value="invoice.payment_failed">Payment Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Table */}
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Event</th>
                    <th className="text-left p-4 font-medium">Type</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-left p-4 font-medium">Processed</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-mono text-sm">{event.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{formatEventType(event.type)}</div>
                        <div className="text-sm text-muted-foreground">{event.type}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(event.status)}
                          {getStatusBadge(event.status)}
                        </div>
                        {event.error && (
                          <div className="text-sm text-red-600 mt-1">
                            {event.error}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(event.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {event.processedAt ? 
                            new Date(event.processedAt).toLocaleString() :
                            '-'
                          }
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {event.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEventAction(event.id, 'retry')}
                              disabled={processing === event.id}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No webhook events found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card className="fixed inset-0 z-50 m-4 max-w-4xl mx-auto my-8 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedEvent.status)}
                  Webhook Event Details
                </CardTitle>
                <CardDescription className="font-mono">
                  {selectedEvent.id}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Event Type</label>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedEvent.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Created At</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedEvent.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Processed At</label>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.processedAt ? 
                    new Date(selectedEvent.processedAt).toLocaleString() :
                    'Not processed'
                  }
                </p>
              </div>
            </div>

            {selectedEvent.error && (
              <div>
                <label className="text-sm font-medium text-red-600">Error</label>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                  {selectedEvent.error}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Payload</label>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-2">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
            </div>

            <div className="flex gap-2 pt-4">
              {selectedEvent.status === 'failed' && (
                <Button 
                  onClick={() => handleEventAction(selectedEvent.id, 'retry')}
                  disabled={processing === selectedEvent.id}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Processing
                </Button>
              )}
              {selectedEvent.status === 'pending' && (
                <Button 
                  variant="outline"
                  onClick={() => handleEventAction(selectedEvent.id, 'mark_processed')}
                  disabled={processing === selectedEvent.id}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Processed
                </Button>
              )}
              <Button 
                variant="destructive"
                onClick={() => handleEventAction(selectedEvent.id, 'delete')}
                disabled={processing === selectedEvent.id}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}