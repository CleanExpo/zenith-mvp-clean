'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { RealtimeMetrics, RealtimeEvent } from '@/lib/realtime/websocket-server'
import { AggregatedMetrics, RealtimeAlert } from '@/lib/realtime/data-aggregator'

export interface RealtimeData {
  metrics: RealtimeMetrics | null
  events: RealtimeEvent[]
  alerts: RealtimeAlert[]
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastUpdated: number | null
}

export interface UseRealtimeAnalyticsOptions {
  autoConnect?: boolean
  maxEvents?: number
  maxAlerts?: number
  reconnectInterval?: number
  fallbackToPolling?: boolean
  pollingInterval?: number
}

export function useRealtimeAnalytics(options: UseRealtimeAnalyticsOptions = {}) {
  const {
    autoConnect = true,
    maxEvents = 50,
    maxAlerts = 20,
    reconnectInterval = 5000,
    fallbackToPolling = true,
    pollingInterval = 10000
  } = options

  const [data, setData] = useState<RealtimeData>({
    metrics: null,
    events: [],
    alerts: [],
    isConnected: false,
    connectionStatus: 'disconnected',
    lastUpdated: null
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const updateData = useCallback((updates: Partial<RealtimeData>) => {
    if (!mountedRef.current) return
    
    setData(prev => ({
      ...prev,
      ...updates,
      lastUpdated: Date.now()
    }))
  }, [])

  const connectWebSocket = useCallback(async () => {
    if (!mountedRef.current) return
    
    updateData({ connectionStatus: 'connecting' })

    try {
      // Try WebSocket connection first
      const { realtimeClient } = await import('@/lib/realtime/client-manager')
      
      await realtimeClient.connect()
      
      updateData({ 
        isConnected: true, 
        connectionStatus: 'connected' 
      })
      
      // Set up event listeners
      realtimeClient.on('message', (message: any) => {
        if (!mountedRef.current) return
        handleMessage(message)
      })
      realtimeClient.on('disconnected', () => {
        if (!mountedRef.current) return
        updateData({ 
          isConnected: false, 
          connectionStatus: 'disconnected' 
        })
      })
      realtimeClient.on('error', () => {
        if (!mountedRef.current) return
        updateData({ 
          isConnected: false, 
          connectionStatus: 'error' 
        })
        if (fallbackToPolling) {
          startPolling()
        }
      })
      
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      
    } catch (error) {
      console.error('WebSocket connection failed, falling back to polling:', error)
      updateData({ connectionStatus: 'error' })
      
      if (fallbackToPolling) {
        startPolling()
      }
    }
  }, [updateData, fallbackToPolling])

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'metrics':
        updateData({ metrics: message.data })
        break
        
      case 'event':
        setData(prev => ({
          ...prev,
          events: [message.data, ...prev.events.slice(0, maxEvents - 1)],
          lastUpdated: Date.now()
        }))
        break
        
      case 'alert':
        setData(prev => ({
          ...prev,
          alerts: [message.data, ...prev.alerts.slice(0, maxAlerts - 1)],
          lastUpdated: Date.now()
        }))
        break
        
      case 'user_count':
        updateData({ 
          metrics: data.metrics ? { 
            ...data.metrics, 
            activeUsers: message.data.count 
          } : null 
        })
        break
        
      default:
        console.log('Unknown message type:', message.type)
    }
  }, [updateData, maxEvents, maxAlerts, data.metrics])

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        connectWebSocket()
      }
    }, reconnectInterval)
  }, [connectWebSocket, reconnectInterval])

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return
    
    console.log('Starting polling fallback')
    
    const poll = async () => {
      if (!mountedRef.current) return
      
      try {
        // Try API first, fall back to demo data
        const response = await fetch('/api/realtime/metrics')
        if (response.ok) {
          const metrics = await response.json()
          updateData({ metrics })
        } else {
          throw new Error('API not available')
        }
      } catch (error) {
        console.log('API polling failed, using demo data:', error)
        
        // Use demo data as fallback
        const { demoDataGenerator } = await import('@/lib/realtime/demo-data')
        const demoMetrics = demoDataGenerator.generateMetrics()
        updateData({ metrics: demoMetrics })
        
        // Occasionally generate demo events
        if (Math.random() < 0.3) { // 30% chance
          const demoEvent = demoDataGenerator.generateEvent()
          setData(prev => ({
            ...prev,
            events: [demoEvent, ...prev.events.slice(0, maxEvents - 1)],
            lastUpdated: Date.now()
          }))
        }
      }
    }
    
    // Initial poll
    poll()
    
    // Set up interval
    pollingIntervalRef.current = setInterval(poll, pollingInterval)
  }, [updateData, pollingInterval, maxEvents])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    updateData({ 
      isConnected: false, 
      connectionStatus: 'disconnected' 
    })
  }, [updateData])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      if (mountedRef.current) {
        connectWebSocket()
      }
    }, 1000)
  }, [disconnect, connectWebSocket])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  // Filter and search functions
  const filterEvents = useCallback((filter: {
    type?: string
    user?: string
    page?: string
    timeRange?: [number, number]
  }) => {
    return data.events.filter(event => {
      if (filter.type && event.type !== filter.type) return false
      if (filter.user && event.user?.id !== filter.user) return false
      if (filter.page && event.page !== filter.page) return false
      if (filter.timeRange) {
        const [start, end] = filter.timeRange
        if (event.timestamp < start || event.timestamp > end) return false
      }
      return true
    })
  }, [data.events])

  const getMetricHistory = useCallback((metric: keyof RealtimeMetrics, points: number = 20) => {
    // This would be implemented with stored historical data
    // For now, return mock data
    const history = []
    const now = Date.now()
    
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = now - (i * 60000) // 1 minute intervals
      const value = data.metrics?.[metric] || 0
      // Add some variance for demo
      const variance = Math.random() * 0.2 - 0.1 // ±10%
      history.push({
        timestamp,
        value: Math.max(0, value * (1 + variance))
      })
    }
    
    return history
  }, [data.metrics])

  // Effects
  useEffect(() => {
    mountedRef.current = true
    
    if (autoConnect) {
      connectWebSocket()
    }

    return () => {
      mountedRef.current = false
      disconnect()
    }
  }, [autoConnect, connectWebSocket, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  return {
    data,
    isConnected: data.isConnected,
    connectionStatus: data.connectionStatus,
    connect: connectWebSocket,
    disconnect,
    reconnect,
    sendMessage,
    filterEvents,
    getMetricHistory
  }
}