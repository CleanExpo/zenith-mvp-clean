'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AccountSettings } from '@/components/settings/account-settings'
import { BillingSettings } from '@/components/settings/billing-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { ApiSettings } from '@/components/settings/api-settings'
import { 
  User, 
  CreditCard, 
  Bell, 
  Key,
  Settings as SettingsIcon
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your account, billing, notifications, and API access
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Keys
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <BillingSettings />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <ApiSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </ProtectedRoute>
  )
}