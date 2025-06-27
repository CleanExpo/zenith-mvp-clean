'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth-context'
import { PRICING_PLANS, formatPrice, type PlanId } from '@/lib/stripe'
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertTriangle, 
  Check, 
  X, 
  Calendar,
  CreditCard,
  Info
} from 'lucide-react'

interface Subscription {
  id: string
  planId: PlanId
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
}

interface SubscriptionManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: PlanId
  subscription: Subscription | null
  onPlanChange: (planId: PlanId) => void
}

type FlowType = 'upgrade' | 'downgrade' | 'cancel' | 'reactivate' | null

export function SubscriptionManager({ 
  open, 
  onOpenChange, 
  currentPlan, 
  subscription, 
  onPlanChange 
}: SubscriptionManagerProps) {
  const { demoMode } = useAuth()
  const [currentFlow, setCurrentFlow] = useState<FlowType>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const planOrder: PlanId[] = ['free', 'pro', 'enterprise']
  const currentPlanIndex = planOrder.indexOf(currentPlan)

  const isUpgrade = (planId: PlanId) => {
    return planOrder.indexOf(planId) > currentPlanIndex
  }

  const isDowngrade = (planId: PlanId) => {
    return planOrder.indexOf(planId) < currentPlanIndex
  }

  const calculateProration = (fromPlan: PlanId, toPlan: PlanId) => {
    if (!subscription) return 0
    
    const currentPrice = PRICING_PLANS[fromPlan].price
    const newPrice = PRICING_PLANS[toPlan].price
    const daysRemaining = Math.ceil(
      (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysInPeriod = 30 // Assuming monthly billing
    
    const unusedAmount = (currentPrice * daysRemaining) / daysInPeriod
    const newAmount = (newPrice * daysRemaining) / daysInPeriod
    
    return newAmount - unusedAmount
  }

  const handlePlanSelect = (planId: PlanId) => {
    if (planId === currentPlan) return
    
    setSelectedPlan(planId)
    
    if (isUpgrade(planId)) {
      setCurrentFlow('upgrade')
    } else if (isDowngrade(planId)) {
      setCurrentFlow('downgrade')
    }
  }

  const handleConfirmChange = async () => {
    if (!selectedPlan) return
    
    setLoading(true)
    
    try {
      if (demoMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulate success
        onPlanChange(selectedPlan)
        alert(`Demo: Successfully changed to ${PRICING_PLANS[selectedPlan].name} plan`)
      } else {
        // In real app, make API call to change subscription
        const response = await fetch('/api/billing/change-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: selectedPlan,
            subscriptionId: subscription?.id
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to change plan')
        }
        
        const data = await response.json()
        onPlanChange(selectedPlan)
      }
      
      setCurrentFlow(null)
      setSelectedPlan(null)
    } catch (error) {
      console.error('Error changing plan:', error)
      alert('Failed to change plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    setLoading(true)
    
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        alert('Demo: Subscription would be canceled at the end of current period')
      } else {
        const response = await fetch('/api/billing/cancel-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionId: subscription.id,
            cancelAtPeriodEnd: true
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to cancel subscription')
        }
      }
      
      setShowCancelConfirm(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!subscription) return
    
    setLoading(true)
    
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert('Demo: Subscription would be reactivated')
      } else {
        const response = await fetch('/api/billing/reactivate-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionId: subscription.id
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to reactivate subscription')
        }
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      alert('Failed to reactivate subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderPlanSelection = () => (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Change Your Plan</DialogTitle>
        <DialogDescription>
          Choose a new plan that better fits your needs. Changes take effect immediately.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-3">
        {Object.entries(PRICING_PLANS).map(([key, plan]) => {
          const planId = key as PlanId
          const isCurrent = planId === currentPlan
          const isSelected = planId === selectedPlan
          
          return (
            <Card 
              key={planId}
              className={`cursor-pointer transition-all ${
                isCurrent 
                  ? 'border-primary bg-primary/5' 
                  : isSelected 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'hover:border-gray-300'
              }`}
              onClick={() => !isCurrent && handlePlanSelect(planId)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {isCurrent && <Badge variant="outline">Current</Badge>}
                      {plan.popular && <Badge>Popular</Badge>}
                      {isUpgrade(planId) && <Badge variant="outline" className="text-green-600">Upgrade</Badge>}
                      {isDowngrade(planId) && <Badge variant="outline" className="text-orange-600">Downgrade</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                    <p className="font-semibold">
                      {formatPrice(plan.price)}
                      {plan.price > 0 && <span className="text-sm text-muted-foreground">/{plan.interval}</span>}
                    </p>
                  </div>
                  {!isCurrent && (
                    <div className="ml-4">
                      {isUpgrade(planId) ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </DialogFooter>
    </div>
  )

  const renderPlanChangeConfirmation = () => {
    if (!selectedPlan || !currentFlow) return null
    
    const selectedPlanData = PRICING_PLANS[selectedPlan]
    const currentPlanData = PRICING_PLANS[currentPlan]
    const prorationAmount = calculateProration(currentPlan, selectedPlan)
    
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>
            {currentFlow === 'upgrade' ? 'Confirm Upgrade' : 'Confirm Downgrade'}
          </DialogTitle>
          <DialogDescription>
            Review the changes to your subscription
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">{currentPlanData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(currentPlanData.price)}/{currentPlanData.interval}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">New Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">{selectedPlanData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(selectedPlanData.price)}/{selectedPlanData.interval}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {currentFlow === 'upgrade' && prorationAmount > 0 && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertTitle>Prorated Billing</AlertTitle>
              <AlertDescription>
                You&apos;ll be charged {formatPrice(prorationAmount)} today for the remaining billing period.
                Your next full billing cycle starts on {subscription && new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
              </AlertDescription>
            </Alert>
          )}
          
          {currentFlow === 'downgrade' && (
            <Alert variant="warning">
              <Info className="w-4 h-4" />
              <AlertTitle>Downgrade Information</AlertTitle>
              <AlertDescription>
                Your plan will be downgraded immediately. You&apos;ll receive a prorated credit of {formatPrice(Math.abs(prorationAmount))} 
                applied to your next billing cycle.
                <br /><br />
                <strong>Features you&apos;ll lose:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {currentPlanData.features
                    .filter(feature => !(selectedPlanData.features as readonly string[]).includes(feature))
                    .map((feature, index) => (
                      <li key={index} className="text-sm">{feature}</li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setCurrentFlow(null)
              setSelectedPlan(null)
            }}
          >
            Back
          </Button>
          <Button 
            onClick={handleConfirmChange}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Confirm ${currentFlow === 'upgrade' ? 'Upgrade' : 'Downgrade'}`}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  const renderCancelFlow = () => (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogDescription>
          We&apos;re sorry to see you go. Here are some options:
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Retention Offers */}
        <div className="space-y-3">
          <h4 className="font-medium">Before you cancel, consider:</h4>
          
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <ArrowDownCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 dark:text-blue-100">
                    Downgrade to Free Plan
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Keep your account active with basic features at no cost.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => handlePlanSelect('free')}
                  >
                    Switch to Free
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-900 dark:text-green-100">
                    Pause Your Subscription
                  </h5>
                  <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                    Take a break for up to 3 months. We&apos;ll hold your data and settings.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => alert('Demo: Pause subscription feature')}
                  >
                    Pause Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Cancel Confirmation */}
        {showCancelConfirm ? (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Confirm Cancellation</AlertTitle>
            <AlertDescription>
              Are you sure you want to cancel your subscription? 
              {subscription && !subscription.cancelAtPeriodEnd && (
                <>
                  <br />
                  You&apos;ll continue to have access until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                  After that, your account will be downgraded to the free plan.
                </>
              )}
            </AlertDescription>
            <div className="flex gap-2 mt-3">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                {loading ? 'Canceling...' : 'Yes, Cancel Subscription'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Subscription
              </Button>
            </div>
          </Alert>
        ) : (
          <Button 
            variant="destructive" 
            onClick={() => setShowCancelConfirm(true)}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Subscription
          </Button>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Keep My Subscription
        </Button>
      </DialogFooter>
    </div>
  )

  const renderContent = () => {
    if (currentFlow === 'upgrade' || currentFlow === 'downgrade') {
      return renderPlanChangeConfirmation()
    }
    
    if (currentFlow === 'cancel') {
      return renderCancelFlow()
    }
    
    return renderPlanSelection()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        
        {/* Quick Actions Bar */}
        {!currentFlow && (
          <div className="flex gap-2 mb-4">
            {currentPlan !== 'free' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentFlow('cancel')}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Plan
              </Button>
            )}
            
            {subscription?.cancelAtPeriodEnd && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReactivate}
                disabled={loading}
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? 'Reactivating...' : 'Reactivate'}
              </Button>
            )}
          </div>
        )}
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}