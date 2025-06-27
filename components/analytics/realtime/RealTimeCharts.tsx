'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRealtimeAnalytics } from '@/lib/hooks/useRealtimeAnalytics'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { format } from 'date-fns'

interface ChartDataPoint {
  timestamp: number
  time: string
  users: number
  pageViews: number
  events: number
  revenue: number
  conversions: number
  responseTime: number
}

export function RealTimeCharts() {
  const { data, getMetricHistory } = useRealtimeAnalytics()
  const [isPlaying, setIsPlaying] = useState(true)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(['users', 'pageViews']))

  // Generate chart data from real-time metrics
  useEffect(() => {
    if (data.metrics && isPlaying) {
      const now = Date.now()
      const newDataPoint: ChartDataPoint = {
        timestamp: now,
        time: format(now, 'HH:mm:ss'),
        users: data.metrics.activeUsers,
        pageViews: data.metrics.pageViews,
        events: data.metrics.events,
        revenue: data.metrics.revenue,
        conversions: data.metrics.conversions,
        responseTime: data.metrics.responseTime
      }

      setChartData(prev => {
        const updated = [...prev, newDataPoint]
        // Keep only last 50 points for performance
        return updated.slice(-50)
      })
    }
  }, [data.metrics, isPlaying])

  // Chart colors
  const colors = {
    users: '#3B82F6',
    pageViews: '#8B5CF6',
    events: '#F59E0B',
    revenue: '#10B981',
    conversions: '#EF4444',
    responseTime: '#6B7280'
  }

  const toggleMetric = (metric: string) => {
    const newSelected = new Set(selectedMetrics)
    if (newSelected.has(metric)) {
      newSelected.delete(metric)
    } else {
      newSelected.add(metric)
    }
    setSelectedMetrics(newSelected)
  }

  const clearData = () => {
    setChartData([])
  }

  // Pie chart data for current distribution
  const pieData = useMemo(() => {
    if (!data.metrics) return []
    
    return [
      { name: 'Active Users', value: data.metrics.activeUsers, color: colors.users },
      { name: 'Page Views', value: data.metrics.pageViews, color: colors.pageViews },
      { name: 'Events', value: data.metrics.events, color: colors.events },
      { name: 'Conversions', value: data.metrics.conversions, color: colors.conversions }
    ].filter(item => item.value > 0)
  }, [data.metrics])

  // Revenue trend data
  const revenueData = useMemo(() => {
    return chartData.map(point => ({
      time: point.time,
      revenue: point.revenue,
      conversions: point.conversions
    }))
  }, [chartData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Chart Controls */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Real-Time Charts</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPlaying ? 'default' : 'outline'}
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Play
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearData}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </Button>
          </div>
        </div>

        {/* Metric Toggles */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(colors).map(([metric, color]) => (
            <Badge
              key={metric}
              variant={selectedMetrics.has(metric) ? 'default' : 'outline'}
              className="cursor-pointer transition-all hover:scale-105"
              style={selectedMetrics.has(metric) ? { backgroundColor: color } : {}}
              onClick={() => toggleMetric(metric)}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="line" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="line" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Line
            </TabsTrigger>
            <TabsTrigger value="area" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Area
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Bar
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-1">
              <PieChartIcon className="h-3 w-3" />
              Pie
            </TabsTrigger>
          </TabsList>

          {/* Line Chart */}
          <TabsContent value="line" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {Array.from(selectedMetrics).map(metric => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={colors[metric as keyof typeof colors]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Area Chart */}
          <TabsContent value="area" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {Array.from(selectedMetrics).map(metric => (
                    <Area
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={colors[metric as keyof typeof colors]}
                      fill={colors[metric as keyof typeof colors]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Bar Chart */}
          <TabsContent value="bar" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-10)}> {/* Last 10 points for readability */}
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {Array.from(selectedMetrics).map((metric, index) => (
                    <Bar
                      key={metric}
                      dataKey={metric}
                      fill={colors[metric as keyof typeof colors]}
                      radius={[2, 2, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Pie Chart */}
          <TabsContent value="pie" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chart Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Data Points</p>
            <p className="text-lg font-semibold">{chartData.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Update Rate</p>
            <p className="text-lg font-semibold">2s</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className={`text-lg font-semibold ${
              isPlaying ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {isPlaying ? 'Live' : 'Paused'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Active Metrics</p>
            <p className="text-lg font-semibold">{selectedMetrics.size}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}