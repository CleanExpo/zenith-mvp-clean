import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DatabasePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Database Foundation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Supabase integration ready for data operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
              <CardDescription>
                Current Supabase integration status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Supabase client configured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Server & browser clients ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Environment variables needed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Database tables pending</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Database Connection</CardTitle>
              <CardDescription>
                Verify Supabase integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <a href="/api/data">Test API Connection</a>
              </Button>
              <p className="text-sm text-muted-foreground">
                This will test the database connection once environment variables are configured.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              Complete Supabase setup for full functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Create Supabase Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to supabase.com/dashboard and create a new project
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Get API Keys</h4>
                  <p className="text-sm text-muted-foreground">
                    Copy Project URL and API keys from Settings → API
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Configure Environment</h4>
                  <p className="text-sm text-muted-foreground">
                    Copy .env.example to .env.local and add your Supabase credentials
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Test Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the &quot;Test API Connection&quot; button to verify setup
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            ✅ Stage 2 Foundation Ready - Database client configured
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <a href="/">← Back to Home</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/components">View Components</a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}