'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  UserCheck, 
  UserX, 
  Calendar,
  Activity,
  DollarSign,
  Mail,
  MoreHorizontal,
  Eye,
  Ban,
  RefreshCw
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin' | 'premium'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastLogin: string | null
  subscription: {
    plan: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodEnd: string | null
  } | null
  usage: {
    projects: number
    apiCalls: number
    storage: number
  }
  totalRevenue: number
}

interface UserStats {
  total: number
  active: number
  premium: number
  churnRate: number
  averageRevenue: number
  newThisMonth: number
  growthRate: number
}

export function UserManagement() {
  const { user, demoMode } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      if (demoMode) {
        // Demo data
        setStats({
          total: 1247,
          active: 1156,
          premium: 189,
          churnRate: 2.3,
          averageRevenue: 47.50,
          newThisMonth: 89,
          growthRate: 12.4
        })

        setUsers([
          {
            id: 'user1',
            email: 'john.doe@company.com',
            name: 'John Doe',
            role: 'premium',
            status: 'active',
            createdAt: '2023-11-15T10:30:00Z',
            lastLogin: '2023-12-01T14:22:00Z',
            subscription: {
              plan: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-01-15T00:00:00Z'
            },
            usage: {
              projects: 12,
              apiCalls: 25400,
              storage: 4.2
            },
            totalRevenue: 174
          },
          {
            id: 'user2',
            email: 'sarah.wilson@startup.io',
            name: 'Sarah Wilson',
            role: 'user',
            status: 'active',
            createdAt: '2023-11-28T09:15:00Z',
            lastLogin: '2023-12-01T16:45:00Z',
            subscription: {
              plan: 'enterprise',
              status: 'active',
              currentPeriodEnd: '2024-01-28T00:00:00Z'
            },
            usage: {
              projects: 45,
              apiCalls: 125000,
              storage: 25.8
            },
            totalRevenue: 297
          },
          {
            id: 'user3',
            email: 'mike.chen@techcorp.com',
            name: 'Mike Chen',
            role: 'user',
            status: 'inactive',
            createdAt: '2023-10-05T11:20:00Z',
            lastLogin: '2023-11-20T08:30:00Z',
            subscription: null,
            usage: {
              projects: 3,
              apiCalls: 850,
              storage: 0.5
            },
            totalRevenue: 0
          },
          {
            id: 'user4',
            email: 'admin@zenith.com',
            name: 'Admin User',
            role: 'admin',
            status: 'active',
            createdAt: '2023-01-01T00:00:00Z',
            lastLogin: '2023-12-01T17:30:00Z',
            subscription: null,
            usage: {
              projects: 0,
              apiCalls: 0,
              storage: 0
            },
            totalRevenue: 0
          }
        ])
      } else {
        // Real API call would go here
        const response = await fetch('/api/admin/users')
        const data = await response.json()
        setUsers(data.users)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      if (demoMode) {
        alert(`Demo: Would ${action} user ${userId}`)
        return
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        await loadUserData()
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
    }
  }

  const exportUsers = async () => {
    try {
      if (demoMode) {
        alert('Demo: Would export user data as CSV')
        return
      }

      const response = await fetch('/api/admin/users/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting users:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesPlan = planFilter === 'all' || user.subscription?.plan === planFilter
    
    return matchesSearch && matchesStatus && matchesPlan
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +{stats.newThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.active.toLocaleString()}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {((stats.active / stats.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Premium Users</p>
                  <p className="text-2xl font-bold">{stats.premium.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ${stats.averageRevenue.toFixed(2)} avg revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                  <p className="text-2xl font-bold">+{stats.growthRate}%</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.churnRate}% churn rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, view activity, and track subscriptions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportUsers}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={loadUserData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Table */}
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Plan</th>
                    <th className="text-left p-4 font-medium">Usage</th>
                    <th className="text-left p-4 font-medium">Revenue</th>
                    <th className="text-left p-4 font-medium">Last Login</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{user.name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.role === 'admin' && (
                            <Badge variant="secondary" className="mt-1">Admin</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          user.status === 'active' ? 'default' : 
                          user.status === 'suspended' ? 'destructive' : 'secondary'
                        }>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.subscription ? (
                          <div>
                            <Badge variant="outline">
                              {user.subscription.plan}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {user.subscription.status}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>{user.usage.projects} projects</div>
                          <div className="text-muted-foreground">
                            {user.usage.apiCalls.toLocaleString()} calls
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          ${user.totalRevenue.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {user.lastLogin ? 
                            new Date(user.lastLogin).toLocaleDateString() :
                            'Never'
                          }
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'suspend')}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'activate')}
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto my-8 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>User Details</CardTitle>
                <CardDescription>{selectedUser.email}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.name || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedUser.role}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedUser.status}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Created</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedUser.subscription && (
              <div>
                <h4 className="font-medium mb-2">Subscription</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">Plan</label>
                    <p className="text-muted-foreground capitalize">
                      {selectedUser.subscription.plan}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">Status</label>
                    <p className="text-muted-foreground capitalize">
                      {selectedUser.subscription.status}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Usage Statistics</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="font-medium">Projects</label>
                  <p className="text-muted-foreground">
                    {selectedUser.usage.projects}
                  </p>
                </div>
                <div>
                  <label className="font-medium">API Calls</label>
                  <p className="text-muted-foreground">
                    {selectedUser.usage.apiCalls.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Storage</label>
                  <p className="text-muted-foreground">
                    {selectedUser.usage.storage}GB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => handleUserAction(selectedUser.id, 'suspend')}
                className="flex-1"
              >
                {selectedUser.status === 'active' ? 'Suspend User' : 'Activate User'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(`mailto:${selectedUser.email}`)}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}