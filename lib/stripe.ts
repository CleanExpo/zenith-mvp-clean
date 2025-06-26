import Stripe from 'stripe'
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js'

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_publishable_key_here'
  )
}

// Server-side Stripe instance
export const stripe = isStripeConfigured() 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  : null

// Client-side Stripe instance with caching
let stripePromise: Promise<StripeJS | null> | null = null

export function getStripe(): Promise<StripeJS | null> {
  if (!stripePromise) {
    stripePromise = isStripeConfigured()
      ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      : Promise.resolve(null)
  }
  return stripePromise
}

// Pricing plans configuration
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 3 projects',
      '1,000 API calls/month',
      '1GB storage',
      'Basic support',
      'Community access'
    ],
    limits: {
      projects: 3,
      apiCalls: 1000,
      storage: 1, // GB
      teamMembers: 1
    },
    stripePriceId: null,
    popular: false
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Best for growing businesses',
    price: 29,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited projects',
      '50,000 API calls/month',
      '100GB storage',
      'Priority support',
      'Advanced analytics',
      'Team collaboration'
    ],
    limits: {
      projects: -1, // unlimited
      apiCalls: 50000,
      storage: 100, // GB
      teamMembers: 10
    },
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited everything',
      'Custom API limits',
      'Unlimited storage',
      '24/7 dedicated support',
      'Custom analytics',
      'Unlimited team members',
      'SSO integration',
      'Custom contracts'
    ],
    limits: {
      projects: -1, // unlimited
      apiCalls: -1, // unlimited
      storage: -1, // unlimited
      teamMembers: -1 // unlimited
    },
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY,
    popular: false
  }
} as const

export type PlanId = keyof typeof PRICING_PLANS
export type PricingPlan = typeof PRICING_PLANS[PlanId]

// Helper functions
export function getPlan(planId: PlanId): PricingPlan {
  return PRICING_PLANS[planId]
}

export function formatPrice(price: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(price)
}

export function getFeatureAccess(userPlan: PlanId, feature: string): boolean {
  const plan = getPlan(userPlan)
  
  // Define feature access mapping
  const featureAccess: Record<string, PlanId[]> = {
    'unlimited_projects': ['pro', 'enterprise'],
    'advanced_analytics': ['pro', 'enterprise'],
    'team_collaboration': ['pro', 'enterprise'],
    'priority_support': ['pro', 'enterprise'],
    'sso_integration': ['enterprise'],
    'custom_contracts': ['enterprise'],
    'unlimited_storage': ['enterprise'],
    'unlimited_api_calls': ['enterprise']
  }
  
  return featureAccess[feature]?.includes(userPlan) || false
}