'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { PRICING_PLANS, formatPrice, isStripeConfigured, type PlanId } from '@/lib/stripe'
import { Check } from 'lucide-react'

export function PricingPage() {
  const { user, demoMode } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const stripeConfigured = isStripeConfigured()
  
  // In a real app, this would come from your billing context or database
  const currentPlan: PlanId = 'free' // This should be fetched from user's subscription

  const handleSubscribe = async (planId: PlanId) => {
    if (!user) {
      // Redirect to auth page
      window.location.href = '/auth'
      return
    }

    if (!stripeConfigured) {
      // Demo mode - simulate subscription
      setLoading(planId)
      setTimeout(() => {
        alert(`Demo: Would subscribe to ${PRICING_PLANS[planId].name} plan for ${formatPrice(PRICING_PLANS[planId].price)}/month`)
        setLoading(null)
      }, 2000)
      return
    }

    try {
      setLoading(planId)
      
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: PRICING_PLANS[planId].stripePriceId,
          planId,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Error starting checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const getButtonText = (planId: PlanId) => {
    if (loading === planId) return 'Loading...'
    if (currentPlan === planId) return 'Current Plan'
    if (planId === 'free' as PlanId) return 'Get Started'
    if (!user) return 'Sign Up to Subscribe'
    return `Subscribe to ${PRICING_PLANS[planId].name}`
  }

  const isButtonDisabled = (planId: PlanId) => {
    return loading !== null || currentPlan === planId
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
          
          {!stripeConfigured && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    ℹ
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Demo Mode Active</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      Payment processing is running in demo mode. Subscription actions will be simulated.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Object.entries(PRICING_PLANS).map(([key, plan]) => {
            const planId = key as PlanId
            const isCurrentPlan = currentPlan === planId
            const isPopular = plan.popular

            return (
              <Card 
                key={planId} 
                className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/{plan.interval}</span>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(planId)}
                    disabled={isButtonDisabled(planId)}
                    className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={planId === 'free' ? 'outline' : 'default'}
                  >
                    {getButtonText(planId)}
                  </Button>

                  {planId !== 'free' && (
                    <p className="text-xs text-muted-foreground text-center">
                      Cancel anytime. No long-term contracts.
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold">Need something custom?</h3>
          <p className="text-muted-foreground">
            Contact our sales team for enterprise solutions and custom pricing.
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>

        <div className="text-center">
          <Button asChild variant="ghost">
            <a href="/">← Back to Home</a>
          </Button>
        </div>
      </div>
    </main>
  )
}