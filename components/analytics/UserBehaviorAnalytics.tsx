'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Clock, 
  MousePointer, 
  Eye,
  Navigation,
  Smartphone,
  Monitor,
  Globe,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  UserPlus
} from 'lucide-react'

export function UserBehaviorAnalytics() {
  const [timeRange, setTimeRange] = useState('30d')

  const userSegments = [
    { segment: 'New Users', count: 8234, growth: 15.2, color: 'bg-green-100 text-green-800' },
    { segment: 'Returning Users', count: 36997, growth: 8.7, color: 'bg-blue-100 text-blue-800' },
    { segment: 'Power Users', count: 2456, growth: 23.4, color: 'bg-purple-100 text-purple-800' },
    { segment: 'At-Risk Users', count: 1544, growth: -12.3, color: 'bg-red-100 text-red-800' }
  ]

  const userJourney = [
    { step: 'Landing Page', users: 100000, dropoff: 0, conversion: 100 },
    { step: 'Sign Up Page', users: 45000, dropoff: 55000, conversion: 45 },
    { step: 'Email Verification', users: 38250, dropoff: 6750, conversion: 38.25 },
    { step: 'Onboarding', users: 32412, dropoff: 5838, conversion: 32.4 },
    { step: 'First Feature Use', users: 27550, dropoff: 4862, conversion: 27.5 },
    { step: 'Active User', users: 22118, dropoff: 5432, conversion: 22.1 }
  ]

  const sessionData = {
    averageSessionDuration: '4m 32s',
    averagePageViews: 3.7,
    bounceRate: 32.4,
    exitRate: 18.9,
    timeOnPage: '2m 18s',
    scrollDepth: 68.5
  }

  const topExitPages = [
    { page: '/pricing', exits: 2345, rate: 45.2 },
    { page: '/signup', exits: 1876, rate: 38.7 },
    { page: '/features', exits: 1543, rate: 28.9 },
    { page: '/dashboard', exits: 1234, rate: 15.6 },
    { page: '/onboarding', exits: 987, rate: 23.4 }
  ]

  const deviceUsage = [
    { device: 'Desktop', sessions: 567834, percentage: 62.3, avgDuration: '5m 12s' },
    { device: 'Mobile', sessions: 234567, percentage: 25.7, avgDuration: '3m 45s' },
    { device: 'Tablet', sessions: 109234, percentage: 12.0, avgDuration: '4m 28s' }
  ]

  const userFlow = [
    { from: 'Homepage', to: 'Features', users: 12345, conversion: 23.4 },
    { from: 'Features', to: 'Pricing', users: 8976, conversion: 72.7 },
    { from: 'Pricing', to: 'Signup', users: 5432, conversion: 60.5 },
    { from: 'Signup', to: 'Dashboard', users: 3876, conversion: 71.3 },
    { from: 'Dashboard', to: 'Tools', users: 2987, conversion: 77.1 }
  ]

  const cohortData = [
    { cohort: 'January 2025', size: 1234, retention: { week1: 78, week2: 65, week3: 58, week4: 52 } },
    { cohort: 'February 2025', size: 1567, retention: { week1: 82, week2: 69, week3: 61, week4: 56 } },
    { cohort: 'March 2025', size: 1876, retention: { week1: 85, week2: 72, week3: 65, week4: 59 } },
    { cohort: 'April 2025', size: 2134, retention: { week1: 88, week2: 75, week3: 68, week4: 62 } },
    { cohort: 'May 2025', size: 2345, retention: { week1: 91, week2: 78, week3: 71, week4: 65 } }
  ]

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600'
    if (rate >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Time Range:</span>
        {['7d', '30d', '90d', '1y'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* User Segments */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userSegments.map((segment) => (
          <Card key={segment.segment} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{segment.segment}</h3>
              {segment.segment === 'New Users' ? <UserPlus className="h-5 w-5 text-green-600" /> :
               segment.segment === 'Returning Users' ? <UserCheck className="h-5 w-5 text-blue-600" /> :
               segment.segment === 'Power Users' ? <TrendingUp className="h-5 w-5 text-purple-600" /> :
               <UserX className="h-5 w-5 text-red-600" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">{segment.count.toLocaleString()}</p>
            <p className={`text-sm ${segment.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {segment.growth > 0 ? '+' : ''}{segment.growth}% from last period
            </p>
            <Badge className={segment.color} variant="secondary">
              {((segment.count / userSegments.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}% of total
            </Badge>
          </Card>
        ))}
      </div>

      {/* Behavior Analysis Tabs */}
      <Tabs defaultValue="journey" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="journey">User Journey</TabsTrigger>
          <TabsTrigger value="sessions">Session Data</TabsTrigger>
          <TabsTrigger value="devices">Device Usage</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="space-y-6">
          {/* User Journey Funnel */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">User Journey Funnel</h3>
            <div className="space-y-4">
              {userJourney.map((step, index) => (
                <div key={step.step} className="relative">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{step.step}</h4>
                        <p className="text-sm text-gray-500">{step.users.toLocaleString()} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getConversionColor(step.conversion)}`}>
                        {step.conversion}%
                      </p>
                      {step.dropoff > 0 && (
                        <p className="text-sm text-red-600">-{step.dropoff.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  {index < userJourney.length - 1 && (
                    <div className="absolute left-4 top-full w-0.5 h-4 bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* User Flow */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Top User Flows</h3>
            <div className="space-y-4">
              {userFlow.map((flow, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {flow.from} → {flow.to}
                      </p>
                      <p className="text-sm text-gray-500">{flow.users.toLocaleString()} users</p>
                    </div>
                  </div>
                  <Badge className={`${getConversionColor(flow.conversion)} bg-opacity-10`}>
                    {flow.conversion}% conversion
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          {/* Session Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                  <p className="text-2xl font-bold">{sessionData.averageSessionDuration}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Page Views</p>
                  <p className="text-2xl font-bold">{sessionData.averagePageViews}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Bounce Rate</p>
                  <p className="text-2xl font-bold">{sessionData.bounceRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <MousePointer className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Exit Rate</p>
                  <p className="text-2xl font-bold">{sessionData.exitRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-pink-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Time on Page</p>
                  <p className="text-2xl font-bold">{sessionData.timeOnPage}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Scroll Depth</p>
                  <p className="text-2xl font-bold">{sessionData.scrollDepth}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Exit Pages */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Top Exit Pages</h3>
            <div className="space-y-4">
              {topExitPages.map((page) => (
                <div key={page.page} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{page.page}</p>
                    <p className="text-sm text-gray-500">{page.exits.toLocaleString()} exits</p>
                  </div>
                  <Badge variant={page.rate > 40 ? 'destructive' : page.rate > 25 ? 'secondary' : 'default'}>
                    {page.rate}% exit rate
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          {/* Device Usage */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Device Usage Analysis</h3>
            <div className="space-y-6">
              {deviceUsage.map((device) => (
                <div key={device.device} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {device.device === 'Desktop' ? <Monitor className="h-6 w-6 text-blue-600" /> :
                     device.device === 'Mobile' ? <Smartphone className="h-6 w-6 text-green-600" /> :
                     <Smartphone className="h-6 w-6 text-purple-600" />}
                    <div>
                      <h4 className="font-medium text-gray-900">{device.device}</h4>
                      <p className="text-sm text-gray-500">{device.sessions.toLocaleString()} sessions</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-lg">{device.percentage}%</p>
                    <p className="text-sm text-gray-500">Avg: {device.avgDuration}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Device Performance Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Device Performance Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Device performance chart would appear here</p>
                <p className="text-sm text-gray-400">Desktop leads with 62.3% of sessions</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6">
          {/* Cohort Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Cohort Retention Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-gray-900">Cohort</th>
                    <th className="text-right p-2 font-medium text-gray-900">Size</th>
                    <th className="text-right p-2 font-medium text-gray-900">Week 1</th>
                    <th className="text-right p-2 font-medium text-gray-900">Week 2</th>
                    <th className="text-right p-2 font-medium text-gray-900">Week 3</th>
                    <th className="text-right p-2 font-medium text-gray-900">Week 4</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((cohort) => (
                    <tr key={cohort.cohort} className="border-b">
                      <td className="p-2 font-medium text-gray-900">{cohort.cohort}</td>
                      <td className="p-2 text-right text-gray-600">{cohort.size.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        <Badge className={cohort.retention.week1 >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {cohort.retention.week1}%
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <Badge className={cohort.retention.week2 >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {cohort.retention.week2}%
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <Badge className={cohort.retention.week3 >= 60 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {cohort.retention.week3}%
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <Badge className={cohort.retention.week4 >= 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {cohort.retention.week4}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Retention Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Retention Insights</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Key Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Week 1 Retention</span>
                    <span className="text-sm font-medium">84.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Week 4 Retention</span>
                    <span className="text-sm font-medium">58.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Retention Improvement</span>
                    <span className="text-sm font-medium text-green-600">+25% vs Q1</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Trends</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Best Performing Cohort</span>
                    <span className="text-sm font-medium">May 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Largest Cohort</span>
                    <span className="text-sm font-medium">May 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Growth Rate</span>
                    <span className="text-sm font-medium text-green-600">+89% MoM</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}