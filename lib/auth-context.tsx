'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  demoMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  // Check if Supabase is configured
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co'

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setDemoMode(true)
      setLoading(false)
      return
    }

    const supabase = createClient()
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
        setDemoMode(true)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [isSupabaseConfigured])

  const signIn = async (email: string, password: string) => {
    if (demoMode) {
      // Demo mode - simulate successful login
      if (password.length >= 6) {
        const mockUser = {
          id: 'demo-user-id',
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_metadata: { demo: true },
          app_metadata: {},
          aud: 'authenticated'
        } as User
        
        setUser(mockUser)
        return { error: null }
      } else {
        return { error: { message: 'Password must be at least 6 characters in demo mode' } }
      }
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    if (demoMode) {
      // Demo mode - simulate successful signup
      if (password.length >= 6) {
        return { error: null }
      } else {
        return { error: { message: 'Password must be at least 6 characters in demo mode' } }
      }
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    if (demoMode) {
      setUser(null)
      return
    }

    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        demoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}