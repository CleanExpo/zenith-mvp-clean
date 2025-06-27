'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface NotificationSettings {
  email: {
    enabled: boolean
    frequency: 'instant' | 'daily' | 'weekly'
    welcomeEmails: boolean
    securityAlerts: boolean
    productUpdates: boolean
    marketingEmails: boolean
    weeklyDigest: boolean
  }
  push: {
    enabled: boolean
    websiteAlerts: boolean
    teamInvitations: boolean
    systemUpdates: boolean
    maintenanceNotices: boolean
  }
  inApp: {
    enabled: boolean
    sounds: boolean
    desktopNotifications: boolean
    taskReminders: boolean
    reportReady: boolean
  }
  sms: {
    enabled: boolean
    phoneNumber: string
    criticalAlertsOnly: boolean
    securityAlerts: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone: string
  }
}

export function NotificationSettings() {
  const { user, demoMode } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadNotificationSettings()
  }, [user])

  const loadNotificationSettings = async () => {
    try {
      if (demoMode || !user) {
        // Demo data
        setSettings({
          email: {
            enabled: true,
            frequency: 'daily',
            welcomeEmails: true,
            securityAlerts: true,
            productUpdates: false,
            marketingEmails: false,
            weeklyDigest: true
          },
          push: {
            enabled: true,
            websiteAlerts: true,
            teamInvitations: true,
            systemUpdates: false,
            maintenanceNotices: true
          },
          inApp: {
            enabled: true,
            sounds: true,
            desktopNotifications: true,
            taskReminders: true,
            reportReady: true
          },
          sms: {
            enabled: false,
            phoneNumber: '',
            criticalAlertsOnly: true,
            securityAlerts: true
          },
          quietHours: {
            enabled: true,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'America/New_York'
          }
        })
      } else {
        // Real API call
        const response = await fetch('/api/user/notifications')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
      setMessage({ type: 'error', text: 'Failed to load notification settings' })
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: NotificationSettings) => {
    setSaving(true)
    setMessage(null)

    try {
      if (demoMode) {
        // Demo mode simulation
        setTimeout(() => {
          setSettings(newSettings)
          setMessage({ type: 'success', text: 'Demo: Notification settings would be updated' })
          setSaving(false)
        }, 1000)
        return
      }

      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        setSettings(newSettings)
        setMessage({ type: 'success', text: 'Notification settings updated successfully' })
      } else {
        const result = await response.json()
        setMessage({ type: 'error', text: result.error || 'Failed to update settings' })
      }
    } catch (error) {
      console.error('Error updating notification settings:', error)
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: keyof NotificationSettings, key: string, value: any) => {
    if (!settings) return

    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    }
    setSettings(newSettings)
    updateSettings(newSettings)
  }

  const testNotification = async (type: 'email' | 'push' | 'sms') => {
    try {
      if (demoMode) {
        setMessage({ type: 'success', text: `Demo: Test ${type} notification would be sent` })
        return
      }

      const response = await fetch('/api/user/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `Test ${type} notification sent successfully` })
      } else {
        setMessage({ type: 'error', text: `Failed to send test ${type} notification` })
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      setMessage({ type: 'error', text: 'Failed to send test notification' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
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

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load notification settings</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure when and how often you receive emails
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.email.enabled}
                onCheckedChange={(checked) => updateSetting('email', 'enabled', checked)}
                disabled={saving}
              />
              <Button variant="outline" size="sm" onClick={() => testNotification('email')}>
                Test
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Email Frequency</Label>
              <Select
                value={settings.email.frequency}
                onValueChange={(value) => updateSetting('email', 'frequency', value)}
                disabled={!settings.email.enabled || saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Welcome Emails</Label>
                <p className="text-sm text-muted-foreground">Onboarding and getting started emails</p>
              </div>
              <Switch
                checked={settings.email.welcomeEmails}
                onCheckedChange={(checked) => updateSetting('email', 'welcomeEmails', checked)}
                disabled={!settings.email.enabled || saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Login attempts and security changes</p>
              </div>
              <Switch
                checked={settings.email.securityAlerts}
                onCheckedChange={(checked) => updateSetting('email', 'securityAlerts', checked)}
                disabled={!settings.email.enabled || saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Product Updates</Label>
                <p className="text-sm text-muted-foreground">New features and improvements</p>
              </div>
              <Switch
                checked={settings.email.productUpdates}
                onCheckedChange={(checked) => updateSetting('email', 'productUpdates', checked)}
                disabled={!settings.email.enabled || saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Summary of your activity and insights</p>
              </div>
              <Switch
                checked={settings.email.weeklyDigest}
                onCheckedChange={(checked) => updateSetting('email', 'weeklyDigest', checked)}
                disabled={!settings.email.enabled || saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Browser and mobile push notifications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.push.enabled}
                onCheckedChange={(checked) => updateSetting('push', 'enabled', checked)}
                disabled={saving}
              />
              <Button variant="outline" size="sm" onClick={() => testNotification('push')}>
                Test
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Website Alerts</Label>
              <p className="text-sm text-muted-foreground">Issues found during website analysis</p>
            </div>
            <Switch
              checked={settings.push.websiteAlerts}
              onCheckedChange={(checked) => updateSetting('push', 'websiteAlerts', checked)}
              disabled={!settings.push.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Team Invitations</Label>
              <p className="text-sm text-muted-foreground">When you&apos;re invited to join a team</p>
            </div>
            <Switch
              checked={settings.push.teamInvitations}
              onCheckedChange={(checked) => updateSetting('push', 'teamInvitations', checked)}
              disabled={!settings.push.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">System Updates</Label>
              <p className="text-sm text-muted-foreground">New features and system changes</p>
            </div>
            <Switch
              checked={settings.push.systemUpdates}
              onCheckedChange={(checked) => updateSetting('push', 'systemUpdates', checked)}
              disabled={!settings.push.enabled || saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Notifications within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notifications in the app interface</p>
            </div>
            <Switch
              checked={settings.inApp.enabled}
              onCheckedChange={(checked) => updateSetting('inApp', 'enabled', checked)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Notification Sounds</Label>
              <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
            </div>
            <Switch
              checked={settings.inApp.sounds}
              onCheckedChange={(checked) => updateSetting('inApp', 'sounds', checked)}
              disabled={!settings.inApp.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">Show desktop notifications outside the browser</p>
            </div>
            <Switch
              checked={settings.inApp.desktopNotifications}
              onCheckedChange={(checked) => updateSetting('inApp', 'desktopNotifications', checked)}
              disabled={!settings.inApp.enabled || saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Report Ready</Label>
              <p className="text-sm text-muted-foreground">When your website analysis is complete</p>
            </div>
            <Switch
              checked={settings.inApp.reportReady}
              onCheckedChange={(checked) => updateSetting('inApp', 'reportReady', checked)}
              disabled={!settings.inApp.enabled || saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when you don&apos;t want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">Pause non-critical notifications during set hours</p>
            </div>
            <Switch
              checked={settings.quietHours.enabled}
              onCheckedChange={(checked) => updateSetting('quietHours', 'enabled', checked)}
              disabled={saving}
            />
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Start Time</Label>
                <Select
                  value={settings.quietHours.startTime}
                  onValueChange={(value) => updateSetting('quietHours', 'startTime', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">End Time</Label>
                <Select
                  value={settings.quietHours.endTime}
                  onValueChange={(value) => updateSetting('quietHours', 'endTime', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Timezone</Label>
                <Select
                  value={settings.quietHours.timezone}
                  onValueChange={(value) => updateSetting('quietHours', 'timezone', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
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