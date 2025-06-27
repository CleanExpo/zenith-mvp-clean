'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PRICING_PLANS, formatPrice, type PlanId } from '@/lib/stripe'
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface BillingSummaryProps {
  currentPlan: PlanId
  subscription?: {
    status: 'active' | 'canceled' | 'past_due' | 'unpaid'
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  }
  usage?: {
    apiCalls: { current: number; limit: number }
    storage: { current: number; limit: number }
  }
  onManageBilling?: () => void
  compact?: boolean
}

export function BillingSummary({ 
  currentPlan, 
  subscription, 
  usage, 
  onManageBilling,
  compact = false 
}: BillingSummaryProps) {
  const plan = PRICING_PLANS[currentPlan]
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'canceled':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'past_due':
      case 'unpaid':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'canceled':
        return 'Canceled'
      case 'past_due':
        return 'Past Due'
      case 'unpaid':
        return 'Unpaid'
      default:
        return 'Unknown'
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min((current / limit) * 100, 100)
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{plan.name}</span>
                {subscription && (
                  <div className="flex items-center gap-1">
                    {getStatusIcon(subscription.status)}
                    <span className="text-sm text-muted-foreground">
                      {getStatusText(subscription.status)}
                    </span>
                  </div>
                )}
              </div>
              <Badge variant="outline">
                {formatPrice(plan.price)}/{plan.interval}
              </Badge>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onManageBilling}
            >
              <Settings className="w-4 h-4 mr-1" />
              Manage
            </Button>
          </div>
          
          {usage && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">API Calls: </span>
                  <span className="font-medium">
                    {usage.apiCalls.current.toLocaleString()} / {usage.apiCalls.limit === -1 ? '∞' : usage.apiCalls.limit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Storage: </span>
                  <span className="font-medium">
                    {usage.storage.current}GB / {usage.storage.limit === -1 ? '∞' : `${usage.storage.limit}GB`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing Summary
            </CardTitle>
            <CardDescription>
              Current plan and usage overview
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onManageBilling}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Billing
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
              {plan.price > 0 && (
                <span className="text-muted-foreground">/{plan.interval}</span>
              )}
            </div>
          </div>
          
          {subscription && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(subscription.status)}
                <span className="font-medium">{getStatusText(subscription.status)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Usage Overview */}
        {usage && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Usage This Month
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Calls</span>
                  <span>
                    {usage.apiCalls.current.toLocaleString()} / {usage.apiCalls.limit === -1 ? '∞' : usage.apiCalls.limit.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={usage.apiCalls.current} 
                  max={usage.apiCalls.limit === -1 ? usage.apiCalls.current : usage.apiCalls.limit}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {usage.apiCalls.limit === -1 ? 'Unlimited' : `${getUsagePercentage(usage.apiCalls.current, usage.apiCalls.limit).toFixed(1)}% used`}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage</span>
                  <span>
                    {usage.storage.current}GB / {usage.storage.limit === -1 ? '∞' : `${usage.storage.limit}GB`}
                  </span>
                </div>
                <Progress 
                  value={usage.storage.current} 
                  max={usage.storage.limit === -1 ? usage.storage.current : usage.storage.limit}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {usage.storage.limit === -1 ? 'Unlimited' : `${getUsagePercentage(usage.storage.current, usage.storage.limit).toFixed(1)}% used`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Alerts */}
        {subscription?.status === 'past_due' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-red-900">Payment Past Due</h5>
                <p className="text-sm text-red-700 mt-1">
                  Your recent payment failed. Please update your payment method to avoid service interruption.
                </p>
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                  Update Payment Method
                </Button>
              </div>
            </div>
          </div>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-900">Subscription Ending</h5>
                <p className="text-sm text-yellow-700 mt-1">
                  Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                  You&apos;ll be downgraded to the free plan.
                </p>
                <Button size="sm" variant="outline" className="mt-2 border-yellow-300">
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <DollarSign className="w-4 h-4 mr-2" />
            View Invoices
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Usage Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Payment Methods
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}