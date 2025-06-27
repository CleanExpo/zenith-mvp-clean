'use client'

import { WebhookMonitor } from '@/components/admin/webhook-monitor'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const dynamic = 'force-dynamic'

export default function AdminWebhooksPage() {
  return (
    <ProtectedRoute adminOnly>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Webhook Monitor
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Monitor and manage Stripe webhook events and subscription sync
            </p>
          </div>

          <WebhookMonitor />
        </div>
      </main>
    </ProtectedRoute>
  )
}