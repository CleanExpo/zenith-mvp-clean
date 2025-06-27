'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Settings, Layout, Palette, Clock, Bell } from 'lucide-react'

interface DashboardConfig {
  theme: 'light' | 'dark'
  refreshRate: number
  showAnimations: boolean
  compactMode: boolean
  enableNotifications: boolean
  widgets: {
    metrics: boolean
    charts: boolean
    map: boolean
    events: boolean
    health: boolean
  }
  chartTypes: {
    line: boolean
    area: boolean
    bar: boolean
    pie: boolean
  }
}

export function DashboardCustomizer() {
  const [config, setConfig] = useState<DashboardConfig>({
    theme: 'light',
    refreshRate: 2000,
    showAnimations: true,
    compactMode: false,
    enableNotifications: true,
    widgets: {
      metrics: true,
      charts: true,
      map: true,
      events: true,
      health: true
    },
    chartTypes: {
      line: true,
      area: true,
      bar: true,
      pie: true
    }
  })

  const updateConfig = (key: keyof DashboardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const updateWidgetConfig = (widget: keyof DashboardConfig['widgets'], enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      widgets: { ...prev.widgets, [widget]: enabled }
    }))
  }

  const updateChartConfig = (chart: keyof DashboardConfig['chartTypes'], enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      chartTypes: { ...prev.chartTypes, [chart]: enabled }
    }))
  }

  const resetToDefaults = () => {
    setConfig({
      theme: 'light',
      refreshRate: 2000,
      showAnimations: true,
      compactMode: false,
      enableNotifications: true,
      widgets: {
        metrics: true,
        charts: true,
        map: true,
        events: true,
        health: true
      },
      chartTypes: {
        line: true,
        area: true,
        bar: true,
        pie: true
      }
    })
  }

  const saveConfig = () => {
    localStorage.setItem('dashboard-config', JSON.stringify(config))
    // In a real app, this would trigger a dashboard update
    console.log('Dashboard configuration saved:', config)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Dashboard Customization
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme & Appearance */}
          <Card className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme & Appearance
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={config.theme} onValueChange={(value: 'light' | 'dark') => updateConfig('theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Compact Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.compactMode}
                    onCheckedChange={(checked) => updateConfig('compactMode', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {config.compactMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Animations</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.showAnimations}
                    onCheckedChange={(checked) => updateConfig('showAnimations', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {config.showAnimations ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Notifications</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableNotifications}
                    onCheckedChange={(checked) => updateConfig('enableNotifications', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {config.enableNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Refresh Rate */}
          <Card className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Update Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Refresh Rate</Label>
                  <Badge variant="secondary">{config.refreshRate / 1000}s</Badge>
                </div>
                <Slider
                  value={[config.refreshRate]}
                  onValueChange={([value]) => updateConfig('refreshRate', value)}
                  min={1000}
                  max={30000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1s (Fast)</span>
                  <span>30s (Slow)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Widget Configuration */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Dashboard Widgets</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(config.widgets).map(([widget, enabled]) => (
                <div key={widget} className="flex items-center justify-between p-2 border rounded">
                  <Label className="capitalize">{widget.replace(/([A-Z])/g, ' $1')}</Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updateWidgetConfig(widget as keyof DashboardConfig['widgets'], checked)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Chart Configuration */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Chart Types</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(config.chartTypes).map(([chart, enabled]) => (
                <div key={chart} className="flex items-center justify-between p-2 border rounded">
                  <Label className="capitalize">{chart} Chart</Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => updateChartConfig(chart as keyof DashboardConfig['chartTypes'], checked)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Layout Configuration */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Layout Options</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Default Layout</p>
                    <p className="text-sm text-muted-foreground">Standard dashboard with all widgets</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              
              <div className="p-3 border rounded hover:bg-gray-50 transition-colors cursor-pointer opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Minimal Layout</p>
                    <p className="text-sm text-muted-foreground">Key metrics only</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
              
              <div className="p-3 border rounded hover:bg-gray-50 transition-colors cursor-pointer opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Executive Layout</p>
                    <p className="text-sm text-muted-foreground">High-level overview for management</p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                Cancel
              </Button>
              <Button onClick={saveConfig}>
                Save Configuration
              </Button>
            </div>
          </div>

          {/* Configuration Preview */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-medium mb-2">Configuration Summary</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Theme:</span>
                <span className="capitalize">{config.theme}</span>
              </div>
              <div className="flex justify-between">
                <span>Refresh Rate:</span>
                <span>{config.refreshRate / 1000}s</span>
              </div>
              <div className="flex justify-between">
                <span>Active Widgets:</span>
                <span>{Object.values(config.widgets).filter(Boolean).length}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Chart Types:</span>
                <span>{Object.values(config.chartTypes).filter(Boolean).length}/4</span>
              </div>
              <div className="flex justify-between">
                <span>Animations:</span>
                <span>{config.showAnimations ? 'On' : 'Off'}</span>
              </div>
              <div className="flex justify-between">
                <span>Notifications:</span>
                <span>{config.enableNotifications ? 'On' : 'Off'}</span>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}