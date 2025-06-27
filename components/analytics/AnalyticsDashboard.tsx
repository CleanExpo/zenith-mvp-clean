'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  DollarSign,
  ShoppingCart,
  Globe,
  Clock
} from 'lucide-react'

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')

  const analyticsData = {
    totalRevenue: 124560,
    totalUsers: 45231,
    activeUsers: 1423,
    conversionRate: 3.42,
    averageSessionTime: '4m 32s',
    pageViews: 892431,
    bounceRate: 32.4,
    newUsers: 8234
  }

  const topPages = [
    { page: '/', views: 234523, change: 12.5 },
    { page: '/tools/website-analyzer', views: 156789, change: 8.3 },
    { page: '/dashboard', views: 98234, change: -2.1 },
    { page: '/teams', views: 67834, change: 15.7 },
    { page: '/pricing', views: 45123, change: 23.4 }
  ]

  const userAcquisition = [
    { source: 'Organic Search', users: 18456, percentage: 40.8 },
    { source: 'Direct', users: 12234, percentage: 27.0 },
    { source: 'Social Media', users: 6789, percentage: 15.0 },
    { source: 'Referral', users: 4532, percentage: 10.0 },
    { source: 'Email', users: 3220, percentage: 7.1 }
  ]

  const revenueByPlan = [
    { plan: 'Professional', revenue: 67834, subscribers: 456 },
    { plan: 'Enterprise', revenue: 45123, subscribers: 89 },
    { plan: 'Starter', revenue: 11603, subscribers: 1234 }
  ]

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

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${analyticsData.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">+15.2% from last period</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">+12.5% from last period</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">+8.3% from yesterday</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{analyticsData.conversionRate}%</p>
              <p className="text-xs text-green-600">+0.5% improvement</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart would appear here</p>
              <p className="text-sm text-gray-400">Showing {timeRange} data</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">User growth chart would appear here</p>
              <p className="text-sm text-gray-400">Total: {analyticsData.totalUsers.toLocaleString()} users</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Pages */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{page.page}</p>
                  <p className="text-xs text-gray-500">{page.views.toLocaleString()} views</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={page.change > 0 ? 'default' : 'destructive'} className="text-xs">
                    {page.change > 0 ? '+' : ''}{page.change}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* User Acquisition */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Acquisition</h3>
          <div className="space-y-4">
            {userAcquisition.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{source.source}</p>
                  <p className="text-xs text-gray-500">{source.users.toLocaleString()} users</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{source.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue by Plan */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue by Plan</h3>
          <div className="space-y-4">
            {revenueByPlan.map((plan) => (
              <div key={plan.plan} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{plan.plan}</p>
                  <p className="text-xs text-gray-500">{plan.subscribers} subscribers</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${plan.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Page Views</p>
              <p className="text-lg font-semibold">{analyticsData.pageViews.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Session Time</p>
              <p className="text-lg font-semibold">{analyticsData.averageSessionTime}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
              <p className="text-lg font-semibold">{analyticsData.bounceRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">New Users</p>
              <p className="text-lg font-semibold">{analyticsData.newUsers.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}