'use client'

import { BillingDashboard } from '@/components/billing/billing-dashboard'
import { ProtectedRoute } from '@/components/auth/protected-route'

export const dynamic = 'force-dynamic'

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Billing & Subscription
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your subscription, view usage, and access billing history
            </p>
          </div>

          <BillingDashboard />
        </div>
      </main>
    </ProtectedRoute>
  )
}