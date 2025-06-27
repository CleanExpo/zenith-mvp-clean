'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Settings, 
  TestTube,
  AlertCircle,
  User,
  CreditCard,
  RefreshCw,
  Key
} from 'lucide-react'

interface EmailStatus {
  configured: boolean
  demoMode: boolean
  fromEmail: string
  availableTypes: string[]
}

interface EmailTestResult {
  success: boolean
  message: string
  demoMode: boolean
}

export function EmailSystem() {
  const { user } = useAuth()
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')
  const [selectedType, setSelectedType] = useState('test')
  const [sendingTest, setSendingTest] = useState(false)
  const [testResults, setTestResults] = useState<EmailTestResult[]>([])

  useEffect(() => {
    loadEmailStatus()
    if (user?.email) {
      setTestEmail(user.email)
    }
  }, [user])

  const loadEmailStatus = async () => {
    try {
      const response = await fetch('/api/email/test')
      if (response.ok) {
        const data = await response.json()
        setEmailStatus(data)
      }
    } catch (error) {
      console.error('Error loading email status:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail || !selectedType) return

    setSendingTest(true)
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          email: testEmail
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setTestResults(prev => [{
          success: result.success,
          message: result.message,
          demoMode: result.demoMode
        }, ...prev.slice(0, 4)]) // Keep last 5 results
      } else {
        setTestResults(prev => [{
          success: false,
          message: result.error || 'Failed to send email',
          demoMode: result.demoMode || false
        }, ...prev.slice(0, 4)])
      }
    } catch (error) {
      setTestResults(prev => [{
        success: false,
        message: 'Network error occurred',
        demoMode: false
      }, ...prev.slice(0, 4)])
    } finally {
      setSendingTest(false)
    }
  }

  const emailTypeInfo = {
    test: { icon: TestTube, label: 'Test Email', description: 'Basic connectivity test' },
    welcome: { icon: User, label: 'Welcome Email', description: 'New user onboarding' },
    payment: { icon: CreditCard, label: 'Payment Confirmation', description: 'Payment success notification' },
    subscription: { icon: RefreshCw, label: 'Subscription Update', description: 'Plan change notification' },
    reset: { icon: Key, label: 'Password Reset', description: 'Password reset link' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Email Service Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Service Status
              </CardTitle>
              <CardDescription>
                Current configuration and service availability
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadEmailStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Service Status</p>
                <p className="text-sm text-muted-foreground">
                  {emailStatus?.configured ? 'Configured' : 'Demo Mode'}
                </p>
              </div>
              {emailStatus?.configured ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">From Email</p>
                <p className="text-sm text-muted-foreground">
                  {emailStatus?.fromEmail || 'Not configured'}
                </p>
              </div>
              <Settings className="w-6 h-6 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Available Types</p>
                <p className="text-sm text-muted-foreground">
                  {emailStatus?.availableTypes?.length || 0} templates
                </p>
              </div>
              <Mail className="w-6 h-6 text-purple-500" />
            </div>
          </div>

          {emailStatus?.demoMode && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="font-medium text-yellow-800">Demo Mode Active</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                To enable real email sending, configure RESEND_API_KEY and FROM_EMAIL environment variables.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Email Testing
          </CardTitle>
          <CardDescription>
            Test different email templates and delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Email Address</label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(emailTypeInfo).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <info.icon className="w-4 h-4" />
                        {info.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {emailTypeInfo[selectedType as keyof typeof emailTypeInfo]?.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {emailTypeInfo[selectedType as keyof typeof emailTypeInfo]?.description}
              </p>
            </div>
            
            <Button 
              onClick={sendTestEmail}
              disabled={!testEmail || sendingTest}
            >
              {sendingTest ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Recent email test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {result.message}
                      </p>
                      {result.demoMode && (
                        <Badge variant="secondary" className="mt-1">
                          Demo Mode
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration Guide
          </CardTitle>
          <CardDescription>
            How to set up email service for production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Required Environment Variables</h4>
            <div className="grid grid-cols-1 gap-2 text-sm font-mono bg-muted p-3 rounded">
              <div>RESEND_API_KEY=re_your_api_key_here</div>
              <div>FROM_EMAIL=noreply@yourdomain.com</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Steps to Enable</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Sign up for a Resend account at resend.com</li>
              <li>Verify your domain and create an API key</li>
              <li>Add the environment variables to your deployment</li>
              <li>Restart your application</li>
              <li>Test email delivery using the form above</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Features</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Welcome emails for new user registration</li>
              <li>Payment confirmation and receipt emails</li>
              <li>Subscription change notifications</li>
              <li>Password reset emails with secure tokens</li>
              <li>Custom HTML templates with responsive design</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}