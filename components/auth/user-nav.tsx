'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useAdminAuth } from '@/lib/admin-auth'
import { Shield } from 'lucide-react'

export function UserNav() {
  const { user, signOut, loading, demoMode } = useAuth()
  const { isAdmin } = useAdminAuth()

  if (loading) {
    return <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button asChild size="sm" variant="outline">
          <a href="/auth">Sign In</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {demoMode && (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Demo Mode
        </span>
      )}
      
      {/* Navigation links */}
      <div className="flex items-center space-x-2">
        <Button asChild variant="ghost" size="sm">
          <a href="/dashboard">Dashboard</a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href="/billing">Billing</a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href="/pricing">Pricing</a>
        </Button>
        {isAdmin && (
          <Button asChild variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
            <a href="/admin" className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </a>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">
          {user.email}
        </span>
        {demoMode && (
          <span className="text-xs text-muted-foreground">
            Demo User
          </span>
        )}
        {isAdmin && (
          <span className="text-xs text-orange-600 font-medium">
            Admin
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut()}
      >
        Sign Out
      </Button>
    </div>
  )
}