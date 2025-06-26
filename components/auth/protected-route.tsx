'use client'

import { useAuth } from '@/lib/auth-context'
import { AuthPage } from './auth-forms'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || <AuthPage />
  }

  return <>{children}</>
}