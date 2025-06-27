'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { 
  Key, 
  Copy, 
  RotateCcw, 
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Code,
  ExternalLink
} from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string | null
  createdAt: string
  expiresAt: string | null
  usage: {
    total: number
    today: number
    limit: number
  }
}

interface ApiSettings {
  keys: ApiKey[]
  webhookUrl: string
  webhookSecret: string
  rateLimits: {
    perMinute: number
    perHour: number
    perDay: number
  }
  allowedOrigins: string[]
}

export function ApiSettings() {
  const { user, demoMode } = useAuth()
  const [apiSettings, setApiSettings] = useState<ApiSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [newKeyName, setNewKeyName] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadApiSettings()
  }, [user])

  const loadApiSettings = async () => {
    try {
      if (demoMode || !user) {
        // Demo data
        setApiSettings({
          keys: [
            {
              id: 'key_1',
              name: 'Production API',
              key: 'zth_sk_1234567890abcdef',
              permissions: ['read', 'write'],
              lastUsed: '2023-12-01T14:22:00Z',
              createdAt: '2023-11-15T10:30:00Z',
              expiresAt: null,
              usage: {
                total: 15420,
                today: 142,
                limit: 10000
              }
            },
            {
              id: 'key_2',
              name: 'Development',
              key: 'zth_sk_abcdef1234567890',
              permissions: ['read'],
              lastUsed: null,
              createdAt: '2023-11-20T09:15:00Z',
              expiresAt: '2024-11-20T09:15:00Z',
              usage: {
                total: 8,
                today: 0,
                limit: 1000
              }
            }
          ],
          webhookUrl: 'https://api.yourapp.com/webhooks/zenith',
          webhookSecret: 'whsec_1234567890abcdef',
          rateLimits: {
            perMinute: 60,
            perHour: 1000,
            perDay: 10000
          },
          allowedOrigins: ['https://yourapp.com', 'https://staging.yourapp.com']
        })
      } else {
        // Real API call
        const response = await fetch('/api/user/api-keys')
        if (response.ok) {
          const data = await response.json()
          setApiSettings(data)
        }
      }
    } catch (error) {
      console.error('Error loading API settings:', error)
      setMessage({ type: 'error', text: 'Failed to load API settings' })
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for the API key' })
      return
    }

    setCreating(true)
    setMessage(null)

    try {
      if (demoMode) {
        // Demo mode simulation
        setTimeout(() => {
          const newKey: ApiKey = {
            id: `key_${Date.now()}`,
            name: newKeyName,
            key: `zth_sk_${Math.random().toString(36).substr(2, 16)}`,
            permissions: ['read'],
            lastUsed: null,
            createdAt: new Date().toISOString(),
            expiresAt: null,
            usage: {
              total: 0,
              today: 0,
              limit: 1000
            }
          }

          setApiSettings(prev => prev ? {
            ...prev,
            keys: [...prev.keys, newKey]
          } : null)
          
          setNewKeyName('')
          setMessage({ type: 'success', text: 'Demo: API key would be created' })
          setCreating(false)
        }, 1000)
        return
      }

      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      })

      if (response.ok) {
        const newKey = await response.json()
        setApiSettings(prev => prev ? {
          ...prev,
          keys: [...prev.keys, newKey]
        } : null)
        setNewKeyName('')
        setMessage({ type: 'success', text: 'API key created successfully' })
      } else {
        const result = await response.json()
        setMessage({ type: 'error', text: result.error || 'Failed to create API key' })
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      setMessage({ type: 'error', text: 'An error occurred while creating the API key' })
    } finally {
      setCreating(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      if (demoMode) {
        setApiSettings(prev => prev ? {
          ...prev,
          keys: prev.keys.filter(key => key.id !== keyId)
        } : null)
        setMessage({ type: 'success', text: 'Demo: API key would be deleted' })
        return
      }

      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setApiSettings(prev => prev ? {
          ...prev,
          keys: prev.keys.filter(key => key.id !== keyId)
        } : null)
        setMessage({ type: 'success', text: 'API key deleted successfully' })
      } else {
        const result = await response.json()
        setMessage({ type: 'error', text: result.error || 'Failed to delete API key' })
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
      setMessage({ type: 'error', text: 'An error occurred while deleting the API key' })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: 'success', text: 'Copied to clipboard' })
  }

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const regenerateKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      return
    }

    try {
      if (demoMode) {
        setMessage({ type: 'success', text: 'Demo: API key would be regenerated' })
        return
      }

      const response = await fetch(`/api/user/api-keys/${keyId}/regenerate`, {
        method: 'POST'
      })

      if (response.ok) {
        await loadApiSettings()
        setMessage({ type: 'success', text: 'API key regenerated successfully' })
      } else {
        const result = await response.json()
        setMessage({ type: 'error', text: result.error || 'Failed to regenerate API key' })
      }
    } catch (error) {
      console.error('Error regenerating API key:', error)
      setMessage({ type: 'error', text: 'An error occurred while regenerating the API key' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!apiSettings) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load API settings</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* API Keys Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage API keys for programmatic access to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {apiSettings.keys.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Keys</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {apiSettings.keys.reduce((sum, key) => sum + key.usage.today, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Requests Today</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {apiSettings.rateLimits.perDay.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Daily Limit</div>
            </div>
          </div>

          {/* Create New Key */}
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Enter API key name..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createApiKey} disabled={creating || !newKeyName.trim()}>
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Key
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage and monitor your API key usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiSettings.keys.map((key) => (
              <div key={key.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{key.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {key.permissions.map(permission => (
                        <Badge key={permission} variant="secondary">
                          {permission}
                        </Badge>
                      ))}
                      {key.expiresAt && (
                        <Badge variant="outline">
                          Expires {new Date(key.expiresAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateKey(key.id)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">API Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={showSecrets[key.id] ? key.key : '•'.repeat(20)}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSecretVisibility(key.id)}
                      >
                        {showSecrets[key.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Created</Label>
                      <p>{new Date(key.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Last Used</Label>
                      <p>{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Usage Today</Label>
                      <p>{key.usage.today} / {key.usage.limit.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Total Requests</Label>
                      <p>{key.usage.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {apiSettings.keys.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No API keys created yet. Create your first API key to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="webhookUrl"
                value={apiSettings.webhookUrl}
                onChange={(e) => setApiSettings(prev => prev ? {
                  ...prev,
                  webhookUrl: e.target.value
                } : null)}
                placeholder="https://your-app.com/webhooks/zenith"
              />
              <Button variant="outline">
                Test
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="webhookSecret">Webhook Secret</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="webhookSecret"
                value={showSecrets.webhook ? apiSettings.webhookSecret : '•'.repeat(20)}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSecretVisibility('webhook')}
              >
                {showSecrets.webhook ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(apiSettings.webhookSecret)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            API Documentation
          </CardTitle>
          <CardDescription>
            Learn how to integrate with the Zenith API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Getting Started Guide</p>
                <p className="text-sm text-muted-foreground">Basic authentication and first API call</p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">API Reference</p>
                <p className="text-sm text-muted-foreground">Complete endpoint documentation</p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Code Examples</p>
                <p className="text-sm text-muted-foreground">Sample code in multiple languages</p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {message && (
        <Card className={`${
          message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}