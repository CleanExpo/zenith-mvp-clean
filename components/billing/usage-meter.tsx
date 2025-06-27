'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/stripe'

interface UsageItem {
  label: string
  current: number
  limit: number
  unit: string
  icon: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
    period: string
  }
}

interface UsageMeterProps {
  usage: UsageItem[]
  planName: string
  onUpgrade?: () => void
  showTrends?: boolean
}

export function UsageMeter({ usage, planName, onUpgrade, showTrends = false }: UsageMeterProps) {
  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 95) return { color: 'text-red-600', bg: 'bg-red-100', status: 'Critical' }
    if (percentage >= 80) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Warning' }
    if (percentage >= 60) return { color: 'text-blue-600', bg: 'bg-blue-100', status: 'Moderate' }
    return { color: 'text-green-600', bg: 'bg-green-100', status: 'Good' }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'GB' && value >= 1000) {
      return `${(value / 1000).toFixed(1)} TB`
    }
    if (unit === 'calls' && value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (unit === 'calls' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  const criticalUsage = usage.filter(item => {
    const percentage = getUsagePercentage(item.current, item.limit)
    return percentage >= 90 && item.limit !== -1
  })

  return (
    <div className="space-y-6">
      {/* Critical Usage Alert */}
      {criticalUsage.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="w-5 h-5" />
              Usage Limit Warning
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-200">
              You&apos;re approaching limits for {criticalUsage.length} resource{criticalUsage.length > 1 ? 's' : ''}.
              Consider upgrading your plan to avoid service interruption.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={onUpgrade}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                View Detailed Usage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {usage.map((item, index) => {
          const percentage = getUsagePercentage(item.current, item.limit)
          const status = getUsageStatus(percentage)
          
          return (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${status.color} ${status.bg} border-current`}
                  >
                    {status.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Usage Numbers */}
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold">
                      {formatValue(item.current, item.unit)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.limit === -1 ? 'Unlimited' : `of ${formatValue(item.limit, item.unit)}`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.unit} used this month
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={item.current} 
                    max={item.limit === -1 ? item.current : item.limit}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    {item.limit !== -1 && (
                      <span>{Math.round(percentage)}% used</span>
                    )}
                    <span>{item.limit === -1 ? '∞' : formatValue(item.limit, item.unit)}</span>
                  </div>
                </div>

                {/* Trend Information */}
                {showTrends && item.trend && (
                  <div className="flex items-center gap-1 pt-2 border-t">
                    <TrendingUp className={`w-3 h-3 ${
                      item.trend.direction === 'up' ? 'text-red-500' : 'text-green-500'
                    }`} />
                    <span className={`text-xs ${
                      item.trend.direction === 'up' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.trend.direction === 'up' ? '+' : '-'}{item.trend.value}% vs {item.trend.period}
                    </span>
                  </div>
                )}

                {/* Usage Projection */}
                {item.limit !== -1 && percentage > 0 && (
                  <div className="text-xs text-muted-foreground pt-1">
                    {percentage >= 80 ? (
                      <span className="text-red-600">
                        Projected to exceed limit in {Math.max(1, Math.floor((30 * (100 - percentage)) / percentage))} days
                      </span>
                    ) : (
                      <span>
                        On track for {Math.round((item.current / percentage) * 100)} {item.unit} this month
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Plan: {planName}</CardTitle>
          <CardDescription>
            Your usage is being tracked against your plan limits. Upgrade anytime for higher limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onUpgrade} variant="outline">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Compare Plans
            </Button>
            <Button variant="ghost">
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}