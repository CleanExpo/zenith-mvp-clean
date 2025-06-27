'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Key,
  Trash2
} from 'lucide-react'

interface AccountData {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  lastLogin: string | null
  emailVerified: boolean
  twoFactorEnabled: boolean
}

export function AccountSettings() {
  const { user, demoMode } = useAuth()
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadAccountData()
  }, [user])

  const loadAccountData = async () => {
    try {
      if (demoMode || !user) {
        // Demo data
        const demoData = {
          id: 'user_demo',
          email: user?.email || 'demo@example.com',
          name: user?.user_metadata?.name || 'Demo User',
          role: 'user',
          createdAt: '2023-11-15T10:30:00Z',
          lastLogin: '2023-12-01T14:22:00Z',
          emailVerified: true,
          twoFactorEnabled: false
        }
        setAccountData(demoData)
        setFormData({
          name: demoData.name || '',
          email: demoData.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        // Real API call
        const response = await fetch('/api/user/account')
        if (response.ok) {
          const data = await response.json()
          setAccountData(data)
          setFormData({
            name: data.name || '',
            email: data.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading account data:', error)
      setMessage({ type: 'error', text: 'Failed to load account data' })
    } finally {
      setLoading(false)
    }
  }

  const saveAccountSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Validation
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' })
        return
      }

      if (formData.newPassword && formData.newPassword.length < 8) {
        setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
        return
      }

      if (demoMode) {
        // Demo mode simulation
        setTimeout(() => {
          setMessage({ type: 'success', text: 'Demo: Account settings would be updated' })
          setSaving(false)
        }, 1000)
        return
      }

      const response = await fetch('/api/user/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Account settings updated successfully' })
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        await loadAccountData()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update account' })
      }
    } catch (error) {
      console.error('Error saving account settings:', error)
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    if (!confirm('This will permanently delete all your data. Type "DELETE" to confirm:')) {
      return
    }

    try {
      if (demoMode) {
        alert('Demo: Account deletion would be processed')
        return
      }

      const response = await fetch('/api/user/account', {
        method: 'DELETE'
      })

      if (response.ok) {
        window.location.href = '/auth?message=account-deleted'
      } else {
        const result = await response.json()
        setMessage({ type: 'error', text: result.error || 'Failed to delete account' })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setMessage({ type: 'error', text: 'An error occurred while deleting account' })
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

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your account details and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
                {accountData?.emailVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {accountData?.emailVerified ? 'Email verified' : 'Email not verified'}
              </p>
            </div>
          </div>

          {accountData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Account ID</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  {accountData.id}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Role</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={accountData.role === 'admin' ? 'default' : 'secondary'}>
                    {accountData.role}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(accountData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="lastLogin">Last Login</Label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {accountData?.lastLogin 
                    ? new Date(accountData.lastLogin).toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to keep current password
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label className="text-sm font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" disabled>
              <Key className="w-4 h-4 mr-2" />
              {accountData?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button onClick={saveAccountSettings} disabled={saving}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Button variant="destructive" onClick={deleteAccount}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </div>

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