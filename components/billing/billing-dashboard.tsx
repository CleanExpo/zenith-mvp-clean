'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { PRICING_PLANS, formatPrice, isStripeConfigured, type PlanId } from '@/lib/stripe'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Users, 
  Database, 
  Zap,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react'

interface BillingData {
  subscription: {
    id: string
    plan: PlanId
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    trialEnd?: string
  }
  usage: {
    projects: { used: number; limit: number }
    apiCalls: { used: number; limit: number }
    storage: { used: number; limit: number }
    teamMembers: { used: number; limit: number }
  }
  paymentMethod: {
    type: 'card'
    last4: string
    brand: string
    expMonth: number
    expYear: number
  }
  invoices: Array<{
    id: string
    amount: number
    status: 'paid' | 'open' | 'draft'
    date: string
    invoiceUrl: string
  }>
  upcomingInvoice?: {
    amount: number
    date: string
  }
}

export function BillingDashboard() {
  const { user, demoMode } = useAuth()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    loadBillingData()
  }, [user])

  const loadBillingData = async () => {
    if (!user) return

    try {
      if (demoMode || !isStripeConfigured()) {
        // Demo data
        setBillingData({
          subscription: {
            id: 'sub_demo123',
            plan: 'pro',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false
          },
          usage: {
            projects: { used: 7, limit: -1 },
            apiCalls: { used: 12450, limit: 50000 },
            storage: { used: 2.3, limit: 100 },
            teamMembers: { used: 3, limit: 10 }
          },
          paymentMethod: {
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            expMonth: 12,
            expYear: 2025
          },
          invoices: [
            {
              id: 'in_demo1',
              amount: 29,
              status: 'paid',
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              invoiceUrl: '#'
            },
            {
              id: 'in_demo2',
              amount: 29,
              status: 'paid',
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              invoiceUrl: '#'
            }
          ],
          upcomingInvoice: {
            amount: 29,
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      } else {
        // Real Stripe data would be fetched here
        const response = await fetch('/api/billing/dashboard')
        const data = await response.json()
        setBillingData(data)
      }
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: PlanId) => {
    if (!user || !billingData) return

    setUpgrading(planId)
    try {
      if (demoMode || !isStripeConfigured()) {
        // Demo upgrade
        setTimeout(() => {
          alert(`Demo: Would upgrade to ${PRICING_PLANS[planId].name} plan`)
          setUpgrading(null)
        }, 2000)
        return
      }

      const response = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      if (response.ok) {
        await loadBillingData()
      }
    } catch (error) {
      console.error('Error upgrading plan:', error)
    } finally {
      setUpgrading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    try {
      if (demoMode || !isStripeConfigured()) {
        alert('Demo: Subscription would be canceled at period end')
        return
      }

      const response = await fetch('/api/billing/cancel', {
        method: 'POST'
      })

      if (response.ok) {
        await loadBillingData()
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!billingData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No billing data available</p>
        </CardContent>
      </Card>
    )
  }

  const currentPlan = PRICING_PLANS[billingData.subscription.plan]
  const periodEnd = new Date(billingData.subscription.currentPeriodEnd)

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{currentPlan.name}</span>
              <Badge variant={billingData.subscription.status === 'active' ? 'default' : 'destructive'}>
                {billingData.subscription.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {formatPrice(currentPlan.price)}/{currentPlan.interval}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Next billing: {periodEnd.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <CreditCard className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {billingData.paymentMethod.brand} •••• {billingData.paymentMethod.last4}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Expires {billingData.paymentMethod.expMonth}/{billingData.paymentMethod.expYear}
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Next Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            {billingData.upcomingInvoice ? (
              <>
                <div className="text-2xl font-bold mb-1">
                  {formatPrice(billingData.upcomingInvoice.amount)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Due {new Date(billingData.upcomingInvoice.date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No upcoming invoice</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>
            Current usage for your {currentPlan.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Projects
                </span>
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.projects.used}/{billingData.usage.projects.limit === -1 ? '∞' : billingData.usage.projects.limit}
                </span>
              </div>
              <Progress 
                value={billingData.usage.projects.limit === -1 ? 15 : (billingData.usage.projects.used / billingData.usage.projects.limit) * 100} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  API Calls
                </span>
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.apiCalls.used.toLocaleString()}/{billingData.usage.apiCalls.limit === -1 ? '∞' : billingData.usage.apiCalls.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={billingData.usage.apiCalls.limit === -1 ? 25 : (billingData.usage.apiCalls.used / billingData.usage.apiCalls.limit) * 100} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Storage
                </span>
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.storage.used}GB/{billingData.usage.storage.limit === -1 ? '∞' : billingData.usage.storage.limit + 'GB'}
                </span>
              </div>
              <Progress 
                value={billingData.usage.storage.limit === -1 ? 3 : (billingData.usage.storage.used / billingData.usage.storage.limit) * 100} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Team Members
                </span>
                <span className="text-sm text-muted-foreground">
                  {billingData.usage.teamMembers.used}/{billingData.usage.teamMembers.limit === -1 ? '∞' : billingData.usage.teamMembers.limit}
                </span>
              </div>
              <Progress 
                value={billingData.usage.teamMembers.limit === -1 ? 30 : (billingData.usage.teamMembers.used / billingData.usage.teamMembers.limit) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Upgrade Options */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
          <CardDescription>
            Get more features and higher limits with our advanced plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PRICING_PLANS).map(([key, plan]) => {
              const planId = key as PlanId
              const isCurrent = billingData.subscription.plan === planId
              const isUpgrade = currentPlan.price < plan.price

              return (
                <Card key={planId} className={`relative ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                  {isCurrent && (
                    <Badge className="absolute -top-2 left-4">Current Plan</Badge>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      {formatPrice(plan.price)}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm mb-4">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleUpgrade(planId)}
                      disabled={isCurrent || upgrading !== null || !isUpgrade}
                      className="w-full"
                      variant={isCurrent ? 'outline' : 'default'}
                    >
                      {upgrading === planId ? 'Upgrading...' : 
                       isCurrent ? 'Current Plan' : 
                       isUpgrade ? `Upgrade to ${plan.name}` : 'Downgrade'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            Download your past invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{formatPrice(invoice.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                    {invoice.status}
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Actions</CardTitle>
          <CardDescription>
            Manage your subscription and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.subscription.cancelAtPeriodEnd ? (
              <div className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-3" />
                  <div>
                    <p className="font-medium">Subscription Canceled</p>
                    <p className="text-sm text-muted-foreground">
                      Your subscription will end on {periodEnd.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  Reactivate Subscription
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cancel Subscription</p>
                  <p className="text-sm text-muted-foreground">
                    Cancel your subscription at the end of the current billing period
                  </p>
                </div>
                <Button variant="destructive" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Billing Portal</p>
                <p className="text-sm text-muted-foreground">
                  Manage payment methods, download invoices, and update billing information
                </p>
              </div>
              <Button variant="outline">
                Open Billing Portal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}