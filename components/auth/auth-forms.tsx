'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onToggleMode: () => void
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const { signIn, signUp, demoMode } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = mode === 'signin' 
        ? await signIn(email, password)
        : await signUp(email, password)

      if (error) {
        setError(error.message)
      } else if (mode === 'signup' && !demoMode) {
        setSuccess('Check your email for the confirmation link!')
      } else if (mode === 'signup' && demoMode) {
        setSuccess('Account created! You can now sign in.')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {demoMode && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                ℹ
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Demo Mode Active</h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  Authentication is running in demo mode. Use any email and password (6+ characters) to test the system.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                  <strong>Try:</strong> test@example.com / password123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Enter your credentials to access your account' 
              : 'Create a new account to get started'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={demoMode ? "test@example.com" : "Enter your email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={demoMode ? "password123 (6+ chars)" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors font-medium"
              >
                {mode === 'signin' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <AuthForm 
          mode={mode} 
          onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
        />
        
        <div className="text-center mt-6">
          <Button asChild variant="ghost" size="sm" className="text-foreground hover:text-foreground/80">
            <a href="/">← Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  )
}