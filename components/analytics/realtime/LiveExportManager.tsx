'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileText, 
  Database, 
  Image, 
  FileSpreadsheet,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

interface ExportJob {
  id: string
  name: string
  type: 'pdf' | 'csv' | 'json' | 'xlsx' | 'png'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: number
  completedAt?: number
  size?: string
  downloadUrl?: string
}

interface ExportConfig {
  format: 'pdf' | 'csv' | 'json' | 'xlsx' | 'png'
  dateRange: 'current' | 'last_hour' | 'last_24h' | 'last_week' | 'custom'
  includeCharts: boolean
  includeEvents: boolean
  includeMetrics: boolean
  includeAlerts: boolean
  liveUpdates: boolean
  autoSchedule: boolean
  scheduleInterval: 'hourly' | 'daily' | 'weekly' | 'monthly'
}

export function LiveExportManager() {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'pdf',
    dateRange: 'current',
    includeCharts: true,
    includeEvents: true,
    includeMetrics: true,
    includeAlerts: false,
    liveUpdates: false,
    autoSchedule: false,
    scheduleInterval: 'daily'
  })

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: 'job_1',
      name: 'Real-time Dashboard Report',
      type: 'pdf',
      status: 'completed',
      progress: 100,
      createdAt: Date.now() - 300000,
      completedAt: Date.now() - 240000,
      size: '2.4 MB',
      downloadUrl: '#'
    },
    {
      id: 'job_2',
      name: 'Live Events Export',
      type: 'csv',
      status: 'processing',
      progress: 65,
      createdAt: Date.now() - 120000
    },
    {
      id: 'job_3',
      name: 'Metrics Data Export',
      type: 'json',
      status: 'failed',
      progress: 0,
      createdAt: Date.now() - 600000
    }
  ])

  const [isExporting, setIsExporting] = useState(false)

  const updateConfig = (key: keyof ExportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const startExport = async () => {
    setIsExporting(true)
    
    const newJob: ExportJob = {
      id: `job_${Date.now()}`,
      name: `Real-time Export (${config.format.toUpperCase()})`,
      type: config.format,
      status: 'processing',
      progress: 0,
      createdAt: Date.now()
    }
    
    setExportJobs(prev => [newJob, ...prev])
    
    // Simulate export progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { 
                ...job, 
                status: 'completed', 
                progress: 100, 
                completedAt: Date.now(),
                size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
                downloadUrl: '#'
              }
            : job
        ))
        setIsExporting(false)
      } else {
        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, progress } : job
        ))
      }
    }, 500)
  }

  const downloadFile = (job: ExportJob) => {
    // In a real app, this would trigger the actual download
    console.log(`Downloading ${job.name}`)
    
    // Simulate file download
    const element = document.createElement('a')
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Mock ${job.type.toUpperCase()} export data`)
    element.download = `${job.name.toLowerCase().replace(/\s+/g, '_')}.${job.type}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />
      case 'csv':
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case 'json':
        return <Database className="h-4 w-4 text-blue-600" />
      case 'png':
        return <Image className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Live Export Manager
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Export Configuration */}
          <Card className="p-6">
            <h3 className="font-medium mb-4">Export Configuration</h3>
            
            <div className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={config.format} onValueChange={(value: any) => updateConfig('format', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        PDF Report
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        CSV Data
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        Excel Spreadsheet
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        JSON Data
                      </div>
                    </SelectItem>
                    <SelectItem value="png">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-purple-600" />
                        PNG Image
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={config.dateRange} onValueChange={(value: any) => updateConfig('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current View</SelectItem>
                    <SelectItem value="last_hour">Last Hour</SelectItem>
                    <SelectItem value="last_24h">Last 24 Hours</SelectItem>
                    <SelectItem value="last_week">Last Week</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <Label>Include in Export</Label>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-metrics"
                      checked={config.includeMetrics}
                      onCheckedChange={(checked) => updateConfig('includeMetrics', checked)}
                    />
                    <Label htmlFor="include-metrics">Live Metrics</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-charts"
                      checked={config.includeCharts}
                      onCheckedChange={(checked) => updateConfig('includeCharts', checked)}
                    />
                    <Label htmlFor="include-charts">Charts & Graphs</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-events"
                      checked={config.includeEvents}
                      onCheckedChange={(checked) => updateConfig('includeEvents', checked)}
                    />
                    <Label htmlFor="include-events">Event Feed</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-alerts"
                      checked={config.includeAlerts}
                      onCheckedChange={(checked) => updateConfig('includeAlerts', checked)}
                    />
                    <Label htmlFor="include-alerts">Active Alerts</Label>
                  </div>
                </div>
              </div>

              {/* Live Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="live-updates"
                    checked={config.liveUpdates}
                    onCheckedChange={(checked) => updateConfig('liveUpdates', checked)}
                  />
                  <Label htmlFor="live-updates">Include Live Updates</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-schedule"
                    checked={config.autoSchedule}
                    onCheckedChange={(checked) => updateConfig('autoSchedule', checked)}
                  />
                  <Label htmlFor="auto-schedule">Auto-schedule Exports</Label>
                </div>
                
                {config.autoSchedule && (
                  <div className="ml-6 space-y-2">
                    <Label>Schedule Interval</Label>
                    <Select value={config.scheduleInterval} onValueChange={(value: any) => updateConfig('scheduleInterval', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <Button
                onClick={startExport}
                disabled={isExporting}
                className="w-full flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Start Export
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Export History */}
          <Card className="p-6">
            <h3 className="font-medium mb-4">Export History</h3>
            
            <div className="space-y-3">
              {exportJobs.map((job) => (
                <div key={job.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFormatIcon(job.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{job.name}</p>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{format(job.createdAt, 'MMM dd, HH:mm')}</span>
                        {job.size && <span>{job.size}</span>}
                      </div>
                      
                      {job.status === 'processing' && (
                        <div className="mt-2">
                          <Progress value={job.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(job.progress)}% complete
                          </p>
                        </div>
                      )}
                      
                      {job.status === 'completed' && job.downloadUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(job)}
                          className="mt-2 h-6 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {exportJobs.length === 0 && (
                <div className="text-center py-8">
                  <Download className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No exports yet</p>
                  <p className="text-xs text-muted-foreground">Create your first export to get started</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Export Summary */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Export Summary</h4>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="font-medium uppercase">{config.format}</span>
            </div>
            <div className="flex justify-between">
              <span>Date Range:</span>
              <span className="font-medium">{config.dateRange.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Components:</span>
              <span className="font-medium">
                {[config.includeMetrics && 'Metrics', config.includeCharts && 'Charts', 
                  config.includeEvents && 'Events', config.includeAlerts && 'Alerts']
                  .filter(Boolean).length} selected
              </span>
            </div>
            <div className="flex justify-between">
              <span>Live Updates:</span>
              <span className="font-medium">{config.liveUpdates ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
}