'use client'

import { EmailSystem } from '@/components/admin/email-system'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const dynamic = 'force-dynamic'

export default function AdminEmailPage() {
  return (
    <ProtectedRoute adminOnly>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Email System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage email configuration, test templates, and monitor delivery
            </p>
          </div>

          <EmailSystem />
        </div>
      </main>
    </ProtectedRoute>
  )
}