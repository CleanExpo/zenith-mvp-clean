'use client'

import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LiveMetricsDashboard } from '@/components/analytics/realtime/LiveMetricsDashboard'
import { RealTimeCharts } from '@/components/analytics/realtime/RealTimeCharts'
import { ActiveUsersMap } from '@/components/analytics/realtime/ActiveUsersMap'
import { LiveEventFeed } from '@/components/analytics/realtime/LiveEventFeed'
import { SystemHealthMonitor } from '@/components/analytics/realtime/SystemHealthMonitor'
import { DashboardCustomizer } from '@/components/analytics/realtime/DashboardCustomizer'
import { RealTimeFilters } from '@/components/analytics/realtime/RealTimeFilters'
import { AlertsNotifications } from '@/components/analytics/realtime/AlertsNotifications'
import { LiveExportManager } from '@/components/analytics/realtime/LiveExportManager'
import { PageHeader } from '@/components/ui/page-header'
import { Activity, BarChart3, Globe, Bell, Download, Settings } from 'lucide-react'

export default function RealTimeDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Real-Time Analytics Dashboard"
        description="Live monitoring and analytics with real-time updates"
        icon={<Activity className="h-6 w-6" />}
      />

      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <RealTimeFilters />
        <div className="flex items-center gap-2">
          <AlertsNotifications />
          <LiveExportManager />
          <DashboardCustomizer />
        </div>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<div className="h-32 animate-pulse bg-gray-200 rounded-lg" />}>
            <LiveMetricsDashboard />
          </Suspense>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded-lg" />}>
              <RealTimeCharts />
            </Suspense>
            
            <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded-lg" />}>
              <LiveEventFeed />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded-lg" />}>
            <ActiveUsersMap />
          </Suspense>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded-lg" />}>
            <LiveEventFeed detailed={true} />
          </Suspense>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded-lg" />}>
            <SystemHealthMonitor />
          </Suspense>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Real-Time Alerts Configuration</h3>
            <p className="text-muted-foreground mb-4">
              Configure thresholds and notifications for real-time monitoring.
            </p>
            <AlertsNotifications expanded={true} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}