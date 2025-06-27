'use client'

import { withAdminAuth } from '@/lib/admin-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BarChart3, Settings, Activity, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function AdminDashboard() {
  const quickStats = [
    {
      title: 'Total Users',
      value: '12,847',
      change: '+23.1%',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Monthly Revenue',
      value: '$142.5K',
      change: '+15.2%',
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Active Sessions',
      value: '8,923',
      change: '+12.4%',
      icon: Activity,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'System Health',
      value: '99.97%',
      change: 'All Good',
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ]

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage users, view profiles, handle suspensions',
      href: '/admin/users',
      icon: Users,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Analytics Dashboard',
      description: 'View revenue, growth metrics, and system analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and feature flags',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

  const recentActivity = [
    {
      type: 'user',
      message: 'New user registered: john.doe@company.com',
      time: '2 minutes ago',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      type: 'revenue',
      message: 'Enterprise plan subscription activated',
      time: '5 minutes ago',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      type: 'system',
      message: 'System health check completed successfully',
      time: '10 minutes ago',
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
    {
      type: 'alert',
      message: 'High API usage detected - monitoring',
      time: '15 minutes ago',
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      type: 'user',
      message: 'User upgraded to Pro plan: sarah@startup.io',
      time: '20 minutes ago',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome to the Zenith Platform admin panel
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-center">
                    <div className={`rounded-lg p-3 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        <p className="ml-2 text-sm font-medium text-green-600">{stat.change}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link key={index} href={action.href}>
                        <div className="group p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                          <div className="flex items-center mb-4">
                            <div className={`rounded-lg p-3 text-white ${action.color} group-hover:scale-105 transition-transform`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="ml-4 text-lg font-medium text-gray-900 group-hover:text-gray-700">
                              {action.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 group-hover:text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* System Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'API Server', status: 'Operational', color: 'bg-green-500' },
                { name: 'Database', status: 'Operational', color: 'bg-green-500' },
                { name: 'Cache', status: 'Operational', color: 'bg-green-500' },
                { name: 'CDN', status: 'Operational', color: 'bg-green-500' },
                { name: 'Email Service', status: 'Degraded', color: 'bg-yellow-500' },
                { name: 'File Storage', status: 'Operational', color: 'bg-green-500' },
              ].map((service, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${service.color}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAdminAuth(AdminDashboard)