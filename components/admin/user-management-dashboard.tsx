'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, MoreHorizontal, Users, UserCheck, UserX, Crown, Eye, Ban, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, subDays, parseISO } from 'date-fns'

// Demo data
const generateDemoUsers = () => {
  const users = []
  const plans = ['free', 'pro', 'enterprise']
  const statuses = ['active', 'suspended', 'inactive']
  const domains = ['gmail.com', 'company.com', 'business.org', 'startup.io', 'corp.net']
  
  for (let i = 1; i <= 150; i++) {
    users.push({
      id: `user-${i}`,
      email: `user${i}@${domains[Math.floor(Math.random() * domains.length)]}`,
      name: `User ${i}`,
      plan: plans[Math.floor(Math.random() * plans.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      apiCalls: Math.floor(Math.random() * 10000),
      revenue: Math.floor(Math.random() * 500),
      activityScore: Math.floor(Math.random() * 100),
    })
  }
  return users
}

const generateUserGrowthData = () => {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i)
    data.push({
      date: format(date, 'MMM dd'),
      newUsers: Math.floor(Math.random() * 20) + 5,
      totalUsers: 100 + (29 - i) * 15 + Math.floor(Math.random() * 50),
    })
  }
  return data
}

interface User {
  id: string
  email: string
  name: string
  plan: string
  status: string
  createdAt: string
  lastLogin: string
  apiCalls: number
  revenue: number
  activityScore: number
}

interface UserDetailsModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onUserAction: (userId: string, action: string) => void
}

function UserDetailsModal({ user, isOpen, onClose, onUserAction }: UserDetailsModalProps) {
  if (!user) return null

  const activityLogs = [
    { action: 'User login', timestamp: '2024-01-15 10:30:00', ip: '192.168.1.100' },
    { action: 'API call made', timestamp: '2024-01-15 10:25:00', details: 'GET /api/data' },
    { action: 'Plan upgraded', timestamp: '2024-01-14 15:20:00', details: 'Free → Pro' },
    { action: 'Account created', timestamp: '2024-01-10 09:15:00', ip: '192.168.1.100' },
  ]

  const handleAction = (action: string) => {
    onUserAction(user.id, action)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
              <Badge variant="outline">{user.plan}</Badge>
            </div>
          </div>
        </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">User Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">API Calls</p>
                    <p className="text-2xl font-bold text-blue-900">{user.apiCalls.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-900">${user.revenue}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600">Activity Score</p>
                    <p className="text-2xl font-bold text-purple-900">{user.activityScore}%</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600">Account Age</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm">{format(parseISO(user.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Login:</span>
                    <span className="text-sm">{format(parseISO(user.lastLogin), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activityLogs.map((log, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-gray-600">{log.timestamp}</p>
                      {log.details && <p className="text-xs text-gray-500">{log.details}</p>}
                      {log.ip && <p className="text-xs text-gray-500">IP: {log.ip}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('impersonate')}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Impersonate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('change-plan')}
                className="flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Change Plan
              </Button>
            </div>
            <div className="flex gap-2">
              {user.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('suspend')}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('activate')}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Activate
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
  )
}

export function UserManagementDashboard() {
  const [users] = useState<User[]>(generateDemoUsers())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [growthData] = useState(generateUserGrowthData())
  
  const usersPerPage = 20

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      const matchesPlan = filterPlan === 'all' || user.plan === filterPlan
      
      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [users, searchTerm, filterStatus, filterPlan])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage
    return filteredUsers.slice(startIndex, startIndex + usersPerPage)
  }, [filteredUsers, currentPage])

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const userStats = useMemo(() => {
    const total = users.length
    const active = users.filter(u => u.status === 'active').length
    const suspended = users.filter(u => u.status === 'suspended').length
    const revenue = users.reduce((sum, u) => sum + u.revenue, 0)
    
    return { total, active, suspended, revenue }
  }, [users])

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Action: ${action} for user: ${userId}`)
    // In a real app, this would make an API call
    alert(`Demo: ${action} action for user ${userId}`)
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first')
      return
    }
    console.log(`Bulk action: ${action} for users:`, selectedUsers)
    alert(`Demo: ${action} action for ${selectedUsers.length} users`)
    setSelectedUsers([])
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{userStats.total.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{userStats.active.toLocaleString()}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-3xl font-bold text-red-600">{userStats.suspended.toLocaleString()}</p>
            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600">${userStats.revenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">User Growth (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="newUsers" stroke="#3B82F6" strokeWidth={2} name="New Users" />
            <Line type="monotone" dataKey="totalUsers" stroke="#10B981" strokeWidth={2} name="Total Users" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  Activate Selected
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')}>
                  Suspend Selected
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="capitalize">
                      {user.plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {user.status === 'suspended' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(parseISO(user.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{user.activityScore}%</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${user.activityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${user.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserAction={handleUserAction}
      />
    </div>
  )
}