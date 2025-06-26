'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function UserNav() {
  const { user, signOut, loading, demoMode } = useAuth()

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
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">
          {user.email}
        </span>
        {demoMode && (
          <span className="text-xs text-muted-foreground">
            Demo User
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