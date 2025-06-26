'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserNav } from "@/components/auth/user-nav"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user, demoMode } = useAuth()

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Add user navigation */}
      <div className="flex justify-end mb-8">
        <UserNav />
      </div>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Zenith MVP</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to the Zenith Minimal Viable Product
          </p>
          {user && (
            <p className="text-lg text-green-600">
              Welcome back, {user.email}!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current MVP health and functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Next.js App Running</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>TypeScript Configured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>API Routes Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>UI Components Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Supabase Client Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Authentication System Ready</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Current auth configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>{user ? 'Signed In' : 'Not Signed In'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${!demoMode ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span>{!demoMode ? 'Production Mode' : 'Demo Mode'}</span>
              </div>
              {user && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    Signed in as: <span className="font-medium">{user.email}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Features</CardTitle>
              <CardDescription>Test MVP functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <a href="/api/health">Check Health Endpoint</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/components">View Components Showcase</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/database">Database Foundation</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/auth">Authentication Demo</a>
              </Button>
              {user && (
                <Button asChild className="w-full">
                  <a href="/dashboard">Protected Dashboard</a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            🎉 Stage 3 Complete: Authentication Layer fully operational
          </p>
        </div>
      </div>
    </main>
  )
}