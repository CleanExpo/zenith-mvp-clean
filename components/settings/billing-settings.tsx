'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { PRICING_PLANS, formatPrice, isStripeConfigured, type PlanId } from '@/lib/stripe'
import { 
  CreditCard, 
  Receipt, 
  Bell, 
  Download,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings,
  ExternalLink
} from 'lucide-react'

interface BillingSettings {
  subscription: {
    id: string
    plan: PlanId
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  } | null
  paymentMethod: {
    type: 'card'
    last4: string
    brand: string
    expMonth: number
    expYear: number
  } | null
  notifications: {
    paymentFailed: boolean
    subscriptionChanges: boolean
    invoiceReminders: boolean
    usageAlerts: boolean
  }
  invoices: Array<{
    id: string
    amount: number
    status: 'paid' | 'open' | 'draft'
    date: string
    invoiceUrl: string
  }>
  upcomingInvoice: {
    amount: number
    date: string
  } | null
}

export function BillingSettings() {
  const { user, demoMode } = useAuth()
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBillingSettings()
  }, [user])

  const loadBillingSettings = async () => {
    try {
      if (demoMode || !isStripeConfigured()) {
        // Demo data
        setBillingSettings({
          subscription: {
            id: 'sub_demo123',
            plan: 'pro',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false
          },
          paymentMethod: {
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            expMonth: 12,
            expYear: 2025
          },
          notifications: {
            paymentFailed: true,
            subscriptionChanges: true,
            invoiceReminders: false,
            usageAlerts: true
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
        // Real API call
        const response = await fetch('/api/billing/settings')
        if (response.ok) {
          const data = await response.json()
          setBillingSettings(data)
        }
      }
    } catch (error) {
      console.error('Error loading billing settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateNotificationSettings = async (key: keyof BillingSettings['notifications'], value: boolean) => {
    if (!billingSettings) return

    setSaving(true)
    try {
      const updatedNotifications = {
        ...billingSettings.notifications,
        [key]: value
      }

      if (demoMode || !isStripeConfigured()) {
        // Demo mode - just update local state
        setBillingSettings(prev => prev ? {
          ...prev,
          notifications: updatedNotifications
        } : null)
        setSaving(false)
        return
      }

      const response = await fetch('/api/billing/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNotifications)
      })

      if (response.ok) {
        setBillingSettings(prev => prev ? {
          ...prev,
          notifications: updatedNotifications
        } : null)
      }
    } catch (error) {
      console.error('Error updating notification settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const openBillingPortal = async () => {
    try {
      if (demoMode || !isStripeConfigured()) {
        alert('Demo: Would open Stripe billing portal')
        return
      }

      const response = await fetch('/api/billing/portal', {
        method: 'POST'
      })

      if (response.ok) {
        const { url } = await response.json()
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
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
    )
  }

  if (!billingSettings) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No billing information available</p>
        </CardContent>
      </Card>
    )
  }

  const currentPlan = billingSettings.subscription ? 
    PRICING_PLANS[billingSettings.subscription.plan] : 
    PRICING_PLANS.free

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription plan and billing cycle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">
                {formatPrice(currentPlan.price)}/{currentPlan.interval}
              </p>
            </div>
            <div className="text-right">
              {billingSettings.subscription && (
                <Badge variant={billingSettings.subscription.status === 'active' ? 'default' : 'destructive'}>
                  {billingSettings.subscription.status}
                </Badge>
              )}
            </div>
          </div>

          {billingSettings.subscription && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Next Billing Date</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(billingSettings.subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Subscription ID</Label>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {billingSettings.subscription.id}
                </p>
              </div>
            </div>
          )}

          {billingSettings.subscription?.cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Your subscription will cancel at the end of the current period.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Manage your default payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingSettings.paymentMethod ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">
                    {billingSettings.paymentMethod.brand} •••• {billingSettings.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {billingSettings.paymentMethod.expMonth}/{billingSettings.paymentMethod.expYear}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={openBillingPortal}>
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No payment method on file</p>
              <Button onClick={openBillingPortal}>
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Billing Notifications
          </CardTitle>
          <CardDescription>
            Configure when you want to receive billing notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Payment Failed</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a payment fails
                </p>
              </div>
              <Switch
                checked={billingSettings.notifications.paymentFailed}
                onCheckedChange={(checked) => updateNotificationSettings('paymentFailed', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Subscription Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about plan changes and cancellations
                </p>
              </div>
              <Switch
                checked={billingSettings.notifications.subscriptionChanges}
                onCheckedChange={(checked) => updateNotificationSettings('subscriptionChanges', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Invoice Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders before invoices are due
                </p>
              </div>
              <Switch
                checked={billingSettings.notifications.invoiceReminders}
                onCheckedChange={(checked) => updateNotificationSettings('invoiceReminders', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Usage Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when approaching plan limits
                </p>
              </div>
              <Switch
                checked={billingSettings.notifications.usageAlerts}
                onCheckedChange={(checked) => updateNotificationSettings('usageAlerts', checked)}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Recent Invoices
              </CardTitle>
              <CardDescription>
                Download your invoices and receipts
              </CardDescription>
            </div>
            <Button variant="outline" onClick={openBillingPortal}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billingSettings.invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formatPrice(invoice.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                    {invoice.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {billingSettings.invoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No invoices yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Portal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Billing Management
          </CardTitle>
          <CardDescription>
            Access the full billing portal for advanced management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Stripe Billing Portal</p>
              <p className="text-sm text-muted-foreground">
                Update payment methods, download invoices, and view detailed billing history
              </p>
            </div>
            <Button onClick={openBillingPortal}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}