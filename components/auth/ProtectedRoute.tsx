'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { data: session, status } = useSession()

  // Handle loading state and server-side rendering
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Handle authentication
  if (status === 'unauthenticated') {
    redirect('/auth')
  }

  // Handle admin-only routes
  if (adminOnly && session && session.user?.email !== 'zenithfresh25@gmail.com') {
    redirect('/dashboard')
  }

  // If we're still loading or redirecting, show loading state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}