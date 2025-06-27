'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'

interface AdminAuthContextType {
  isAdmin: boolean
  isLoading: boolean
  checkAdminAccess: () => boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// Demo admin users for development/demo mode
const DEMO_ADMIN_EMAILS = [
  'admin@zenith.com',
  'demo@zenith.com',
  'test@admin.com',
  'admin@example.com'
]

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, demoMode } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return

      if (demoMode) {
        // In demo mode, check against demo admin emails
        const adminStatus = user?.email ? DEMO_ADMIN_EMAILS.includes(user.email.toLowerCase()) : false
        setIsAdmin(adminStatus)
        setIsLoading(false)
        return
      }

      if (!user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        // In production, this would check against your database or auth provider
        // For now, we'll use the same demo logic
        const adminStatus = DEMO_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, authLoading, demoMode])

  const checkAdminAccess = () => {
    if (demoMode) {
      return user?.email ? DEMO_ADMIN_EMAILS.includes(user.email.toLowerCase()) : false
    }
    return isAdmin
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        isLoading,
        checkAdminAccess,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

// HOC for protecting admin routes
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminProtectedComponent(props: P) {
    const { isAdmin, isLoading } = useAdminAuth()
    const { user, loading: authLoading } = useAuth()

    if (authLoading || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
      )
    }

    if (!isAdmin) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don&apos;t have admin permissions to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">
              Demo admin emails: {DEMO_ADMIN_EMAILS.join(', ')}
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}