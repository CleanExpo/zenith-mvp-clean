'use client'

import { withAdminAuth } from '@/lib/admin-auth'
import { ErrorTrackingDashboard } from '@/components/admin/error-tracking-dashboard'
import { ArrowLeft, Download, RefreshCw, AlertCircle, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

function ErrorTrackingPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('24h')
  const [criticalErrors, setCriticalErrors] = useState(3) // Mock critical error count

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleExport = () => {
    // In a real app, this would trigger an error report export
    alert('Demo: Error tracking report export initiated')
  }

  const errorSummary = {
    total: 247,
    critical: 3,
    warning: 28,
    info: 216,
    resolved: 189,
    unresolved: 58
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Admin</span>
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gray-900">Error Tracking</h1>
                    {criticalErrors > 0 && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{criticalErrors} Critical</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Application error monitoring, debugging tools, and incident tracking
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </Button>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Errors Alert */}
      {criticalErrors > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {criticalErrors} critical error{criticalErrors > 1 ? 's' : ''} detected. Immediate attention required.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Error Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{errorSummary.total}</p>
              <p className="text-sm text-gray-600">Total Errors</p>
              <p className="text-xs text-gray-500">Last 24h</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{errorSummary.critical}</p>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-xs text-red-500">Needs attention</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{errorSummary.warning}</p>
              <p className="text-sm text-gray-600">Warnings</p>
              <p className="text-xs text-yellow-500">Monitor closely</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{errorSummary.info}</p>
              <p className="text-sm text-gray-600">Info</p>
              <p className="text-xs text-blue-500">Low priority</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{errorSummary.resolved}</p>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-xs text-green-500">Fixed issues</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{errorSummary.unresolved}</p>
              <p className="text-sm text-gray-600">Unresolved</p>
              <p className="text-xs text-orange-500">Open issues</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search errors by message, file, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Dashboard */}
        <ErrorTrackingDashboard 
          searchTerm={searchTerm}
          severityFilter={severityFilter}
          timeFilter={timeFilter}
        />
      </div>
    </div>
  )
}

export default withAdminAuth(ErrorTrackingPage)