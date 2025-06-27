'use client'

import { useState, useMemo } from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Zap, Server, AlertTriangle, CheckCircle } from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'

// Generate demo data
const generateRevenueData = () => {
  const data = []
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const baseRevenue = 50000 + i * 5000
    data.push({
      month: format(date, 'MMM yyyy'),
      mrr: baseRevenue + Math.floor(Math.random() * 10000),
      arr: (baseRevenue + Math.floor(Math.random() * 10000)) * 12,
      churn: Math.random() * 5 + 1,
      newCustomers: Math.floor(Math.random() * 100) + 50,
    })
  }
  return data
}

const generateUserGrowthData = () => {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i)
    data.push({
      date: format(date, 'MMM dd'),
      newUsers: Math.floor(Math.random() * 50) + 10,
      activeUsers: Math.floor(Math.random() * 200) + 500,
      returningUsers: Math.floor(Math.random() * 150) + 300,
    })
  }
  return data
}

const generateUsageData = () => {
  const data = []
  for (let i = 23; i >= 0; i--) {
    data.push({
      hour: `${i}:00`,
      apiCalls: Math.floor(Math.random() * 1000) + 200,
      errors: Math.floor(Math.random() * 50) + 5,
      responseTime: Math.floor(Math.random() * 200) + 50,
    })
  }
  return data
}

const generateFeatureAdoptionData = () => [
  { name: 'Website Analyzer', users: 1250, percentage: 85 },
  { name: 'PDF Reports', users: 980, percentage: 67 },
  { name: 'Team Collaboration', users: 875, percentage: 59 },
  { name: 'API Access', users: 650, percentage: 44 },
  { name: 'Custom Integrations', users: 420, percentage: 29 },
  { name: 'Advanced Analytics', users: 280, percentage: 19 },
]

const generatePlanDistribution = () => [
  { name: 'Free', value: 65, color: '#9CA3AF' },
  { name: 'Pro', value: 25, color: '#3B82F6' },
  { name: 'Enterprise', value: 10, color: '#10B981' },
]

const generateSystemHealth = () => ({
  uptime: 99.97,
  responseTime: 145,
  errorRate: 0.02,
  activeConnections: 1247,
  cpuUsage: 32,
  memoryUsage: 68,
  diskUsage: 45,
  alerts: [
    { type: 'warning', message: 'High memory usage on server-02', time: '2 minutes ago' },
    { type: 'info', message: 'Scheduled maintenance completed', time: '1 hour ago' },
    { type: 'success', message: 'All systems operational', time: '3 hours ago' },
  ]
})

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  prefix?: string
  suffix?: string
}

function MetricCard({ title, value, change, icon, prefix = '', suffix = '' }: MetricCardProps) {
  const isPositive = change > 0
  const isNegative = change < 0
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {prefix}{value}{suffix}
          </p>
          <div className="flex items-center mt-2">
            {isPositive && <TrendingUp className="w-4 h-4 text-green-600 mr-1" />}
            {isNegative && <TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className="text-blue-600">
          {icon}
        </div>
      </div>
    </Card>
  )
}

interface RealTimeMetricProps {
  title: string
  value: string
  status: 'good' | 'warning' | 'critical'
  target?: string
}

function RealTimeMetric({ title, value, status, target }: RealTimeMetricProps) {
  const statusColors = {
    good: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    critical: 'text-red-600 bg-red-50'
  }
  
  const statusIcons = {
    good: <CheckCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    critical: <AlertTriangle className="w-4 h-4" />
  }
  
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {target && <p className="text-xs text-gray-500">Target: {target}</p>}
      </div>
      <div className={`p-2 rounded-full ${statusColors[status]}`}>
        {statusIcons[status]}
      </div>
    </div>
  )
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [revenueData] = useState(generateRevenueData())
  const [userGrowthData] = useState(generateUserGrowthData())
  const [usageData] = useState(generateUsageData())
  const [featureAdoptionData] = useState(generateFeatureAdoptionData())
  const [planDistribution] = useState(generatePlanDistribution())
  const [systemHealth] = useState(generateSystemHealth())

  const currentMetrics = useMemo(() => ({
    mrr: { value: '142.5K', change: 15.2 },
    arr: { value: '1.71M', change: 18.7 },
    churn: { value: '2.3%', change: -0.8 },
    users: { value: '12,847', change: 23.1 },
    activeUsers: { value: '8,923', change: 12.4 },
    apiCalls: { value: '2.4M', change: 8.9 },
  }), [])

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={currentMetrics.mrr.value}
          change={currentMetrics.mrr.change}
          icon={<DollarSign className="w-8 h-8" />}
          prefix="$"
        />
        <MetricCard
          title="Annual Recurring Revenue"
          value={currentMetrics.arr.value}
          change={currentMetrics.arr.change}
          icon={<TrendingUp className="w-8 h-8" />}
          prefix="$"
        />
        <MetricCard
          title="Churn Rate"
          value={currentMetrics.churn.value}
          change={currentMetrics.churn.change}
          icon={<TrendingDown className="w-8 h-8" />}
        />
        <MetricCard
          title="Total Users"
          value={currentMetrics.users.value}
          change={currentMetrics.users.change}
          icon={<Users className="w-8 h-8" />}
        />
        <MetricCard
          title="Active Users"
          value={currentMetrics.activeUsers.value}
          change={currentMetrics.activeUsers.change}
          icon={<Activity className="w-8 h-8" />}
        />
        <MetricCard
          title="API Calls"
          value={currentMetrics.apiCalls.value}
          change={currentMetrics.apiCalls.change}
          icon={<Zap className="w-8 h-8" />}
        />
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`, 
                name === 'mrr' ? 'MRR' : 'ARR'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="mrr" 
              stackId="1"
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.6}
              name="MRR"
            />
            <Area 
              type="monotone" 
              dataKey="arr" 
              stackId="2"
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3}
              name="ARR"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="New Users"
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Active Users"
              />
              <Line 
                type="monotone" 
                dataKey="returningUsers" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Returning Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Plan Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* API Usage */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">API Usage (Last 24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="apiCalls" fill="#3B82F6" name="API Calls" />
            <Bar dataKey="errors" fill="#EF4444" name="Errors" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Feature Adoption */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Feature Adoption</h3>
        <div className="space-y-4">
          {featureAdoptionData.map((feature, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                  <span className="text-sm text-gray-600">{feature.users} users ({feature.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${feature.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Health */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <RealTimeMetric
            title="Uptime"
            value={`${systemHealth.uptime}%`}
            status="good"
            target="99.9%"
          />
          <RealTimeMetric
            title="Response Time"
            value={`${systemHealth.responseTime}ms`}
            status="good"
            target="< 200ms"
          />
          <RealTimeMetric
            title="Error Rate"
            value={`${systemHealth.errorRate}%`}
            status="good"
            target="< 1%"
          />
          <RealTimeMetric
            title="Active Connections"
            value={systemHealth.activeConnections.toLocaleString()}
            status="good"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">CPU Usage</span>
              <span className="text-sm font-bold text-gray-900">{systemHealth.cpuUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${systemHealth.cpuUsage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Memory Usage</span>
              <span className="text-sm font-bold text-gray-900">{systemHealth.memoryUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full" 
                style={{ width: `${systemHealth.memoryUsage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Disk Usage</span>
              <span className="text-sm font-bold text-gray-900">{systemHealth.diskUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${systemHealth.diskUsage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Alerts</h4>
          <div className="space-y-2">
            {systemHealth.alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />}
                  {alert.type === 'info' && <Server className="w-4 h-4 text-blue-600 mr-2" />}
                  {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mr-2" />}
                  <span className="text-sm text-gray-900">{alert.message}</span>
                </div>
                <span className="text-xs text-gray-500">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}