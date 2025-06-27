'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign,
  ShoppingCart,
  UserPlus,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Eye,
  MousePointer
} from 'lucide-react'

interface FunnelStep {
  name: string
  users: number
  conversionRate: number
  dropoffRate: number
  previousStep?: number
}

interface ConversionGoal {
  name: string
  target: number
  actual: number
  period: string
  trend: number
}

export function ConversionFunnels() {
  const [selectedFunnel, setSelectedFunnel] = useState('signup')
  const [timeRange, setTimeRange] = useState('30d')

  const funnels = {
    signup: {
      name: 'User Signup Funnel',
      steps: [
        { name: 'Landing Page Visit', users: 100000, conversionRate: 100, dropoffRate: 0 },
        { name: 'Signup Page View', users: 45000, conversionRate: 45, dropoffRate: 55 },
        { name: 'Form Started', users: 38250, conversionRate: 85, dropoffRate: 15 },
        { name: 'Form Completed', users: 32412, conversionRate: 84.7, dropoffRate: 15.3 },
        { name: 'Email Verified', users: 27550, conversionRate: 85, dropoffRate: 15 },
        { name: 'Profile Complete', users: 22118, conversionRate: 80.3, dropoffRate: 19.7 }
      ]
    },
    purchase: {
      name: 'Purchase Conversion Funnel',
      steps: [
        { name: 'Product Page View', users: 50000, conversionRate: 100, dropoffRate: 0 },
        { name: 'Add to Cart', users: 15000, conversionRate: 30, dropoffRate: 70 },
        { name: 'Checkout Started', users: 12000, conversionRate: 80, dropoffRate: 20 },
        { name: 'Payment Info', users: 9600, conversionRate: 80, dropoffRate: 20 },
        { name: 'Order Complete', users: 8400, conversionRate: 87.5, dropoffRate: 12.5 }
      ]
    },
    trial: {
      name: 'Trial to Paid Conversion',
      steps: [
        { name: 'Trial Started', users: 5000, conversionRate: 100, dropoffRate: 0 },
        { name: 'First Feature Used', users: 4250, conversionRate: 85, dropoffRate: 15 },
        { name: 'Multiple Sessions', users: 3400, conversionRate: 80, dropoffRate: 20 },
        { name: 'Upgrade Intent', users: 1700, conversionRate: 50, dropoffRate: 50 },
        { name: 'Payment Added', users: 1360, conversionRate: 80, dropoffRate: 20 },
        { name: 'Paid Subscriber', users: 1088, conversionRate: 80, dropoffRate: 20 }
      ]
    }
  }

  const conversionGoals = [
    {
      name: 'Signup Conversion Rate',
      target: 25,
      actual: 22.1,
      period: 'Monthly',
      trend: -2.3
    },
    {
      name: 'Trial to Paid',
      target: 20,
      actual: 21.8,
      period: 'Monthly',
      trend: 8.7
    },
    {
      name: 'Purchase Conversion',
      target: 15,
      actual: 16.8,
      period: 'Monthly',
      trend: 12.4
    },
    {
      name: 'Upsell Success',
      target: 30,
      actual: 28.5,
      period: 'Quarterly',
      trend: -1.5
    }
  ]

  const currentFunnel = funnels[selectedFunnel as keyof typeof funnels]

  const getFunnelIcon = (funnelType: string) => {
    switch (funnelType) {
      case 'signup':
        return <UserPlus className="h-5 w-5" />
      case 'purchase':
        return <ShoppingCart className="h-5 w-5" />
      case 'trial':
        return <CreditCard className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  const getStepIcon = (stepName: string) => {
    if (stepName.includes('Landing') || stepName.includes('Product')) return <Eye className="h-4 w-4" />
    if (stepName.includes('Click') || stepName.includes('Add')) return <MousePointer className="h-4 w-4" />
    if (stepName.includes('Complete') || stepName.includes('Order')) return <CheckCircle className="h-4 w-4" />
    if (stepName.includes('Payment')) return <CreditCard className="h-4 w-4" />
    return <Users className="h-4 w-4" />
  }

  const getConversionColor = (rate: number, target?: number) => {
    if (target) {
      if (rate >= target) return 'text-green-600'
      if (rate >= target * 0.8) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (rate >= 70) return 'text-green-600'
    if (rate >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-500'
    if (rate >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-8">
      {/* Funnel Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Conversion Funnels</h2>
          <div className="flex items-center space-x-2">
            {Object.entries(funnels).map(([key, funnel]) => (
              <Button
                key={key}
                variant={selectedFunnel === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFunnel(key)}
                className="flex items-center space-x-2"
              >
                {getFunnelIcon(key)}
                <span>{funnel.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          {['7d', '30d', '90d'].map((range) => (
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
      </div>

      {/* Funnel Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{currentFunnel.steps[0].users.toLocaleString()}</p>
              <p className="text-xs text-blue-600">Starting point</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Final Conversions</p>
              <p className="text-2xl font-bold">
                {currentFunnel.steps[currentFunnel.steps.length - 1].users.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">Completed journey</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Conversion</p>
              <p className="text-2xl font-bold">
                {((currentFunnel.steps[currentFunnel.steps.length - 1].users / currentFunnel.steps[0].users) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600">End-to-end rate</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Biggest Drop-off</p>
              <p className="text-2xl font-bold">
                {Math.max(...currentFunnel.steps.map(s => s.dropoffRate)).toFixed(1)}%
              </p>
              <p className="text-xs text-red-600">Optimization opportunity</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">{currentFunnel.name}</h3>
        <div className="space-y-6">
          {currentFunnel.steps.map((step, index) => (
            <div key={step.name} className="relative">
              <div className="flex items-center justify-between p-6 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStepIcon(step.name)}
                    <div>
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      <p className="text-sm text-gray-500">{step.users.toLocaleString()} users</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getConversionColor(step.conversionRate)}`}>
                      {step.conversionRate}%
                    </p>
                    <p className="text-xs text-gray-500">Conversion rate</p>
                  </div>
                  
                  {step.dropoffRate > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        -{step.dropoffRate}%
                      </p>
                      <p className="text-xs text-gray-500">Drop-off rate</p>
                    </div>
                  )}

                  <div className="w-32">
                    <Progress 
                      value={step.conversionRate} 
                      className="h-2"
                      style={{ '--progress-background': getProgressColor(step.conversionRate) } as any}
                    />
                  </div>
                </div>
              </div>

              {/* Drop-off visualization */}
              {index < currentFunnel.steps.length - 1 && (
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-px h-4 bg-gray-300"></div>
                    <span>
                      {(step.users - currentFunnel.steps[index + 1].users).toLocaleString()} users dropped off
                    </span>
                    <div className="w-px h-4 bg-gray-300"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Conversion Goals */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Conversion Goals & Performance</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {conversionGoals.map((goal) => (
            <div key={goal.name} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{goal.name}</h4>
                <Badge variant={goal.actual >= goal.target ? 'default' : 'destructive'}>
                  {goal.period}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Target</span>
                  <span className="text-sm font-medium">{goal.target}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Actual</span>
                  <span className={`text-sm font-medium ${getConversionColor(goal.actual, goal.target)}`}>
                    {goal.actual}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trend</span>
                  <div className="flex items-center space-x-1">
                    {goal.trend > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${goal.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {goal.trend > 0 ? '+' : ''}{goal.trend}%
                    </span>
                  </div>
                </div>
                
                <Progress 
                  value={(goal.actual / goal.target) * 100} 
                  className="h-2"
                />
                
                <div className="text-xs text-gray-500">
                  {goal.actual >= goal.target ? 
                    `${((goal.actual / goal.target - 1) * 100).toFixed(1)}% above target` :
                    `${((1 - goal.actual / goal.target) * 100).toFixed(1)}% below target`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Funnel Optimization Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Optimization Insights</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Top Opportunities</h4>
            <div className="space-y-3">
              {currentFunnel.steps
                .filter(step => step.dropoffRate > 20)
                .sort((a, b) => b.dropoffRate - a.dropoffRate)
                .slice(0, 3)
                .map((step, index) => (
                  <div key={step.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">{step.name}</p>
                      <p className="text-sm text-red-700">{step.dropoffRate}% drop-off rate</p>
                    </div>
                    <Badge variant="destructive">High Priority</Badge>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Best Performing Steps</h4>
            <div className="space-y-3">
              {currentFunnel.steps
                .filter(step => step.conversionRate > 80)
                .sort((a, b) => b.conversionRate - a.conversionRate)
                .slice(0, 3)
                .map((step, index) => (
                  <div key={step.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">{step.name}</p>
                      <p className="text-sm text-green-700">{step.conversionRate}% conversion rate</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Revenue Impact */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Revenue Impact Analysis</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 border rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">$124,560</p>
            <p className="text-sm text-gray-600">Revenue from conversions</p>
            <p className="text-xs text-green-600">+15.2% vs last period</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">$67,234</p>
            <p className="text-sm text-gray-600">Potential revenue loss</p>
            <p className="text-xs text-red-600">From drop-offs</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">$23,456</p>
            <p className="text-sm text-gray-600">Optimization opportunity</p>
            <p className="text-xs text-purple-600">5% improvement potential</p>
          </div>
        </div>
      </Card>
    </div>
  )
}