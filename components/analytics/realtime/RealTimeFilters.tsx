'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  Calendar as CalendarIcon, 
  X, 
  Search,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface FilterState {
  search: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  location: string
  device: string
  browser: string
  userType: string
  eventType: string
}

export function RealTimeFilters() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: {
      from: undefined,
      to: undefined
    },
    location: 'all',
    device: 'all',
    browser: 'all',
    userType: 'all',
    eventType: 'all'
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      dateRange: {
        from: undefined,
        to: undefined
      },
      location: 'all',
      device: 'all',
      browser: 'all',
      userType: 'all',
      eventType: 'all'
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value !== ''
    if (key === 'dateRange') return value.from || value.to
    return value !== 'all'
  }).length

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' }
  ]

  const devices = [
    { value: 'all', label: 'All Devices' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'tablet', label: 'Tablet' }
  ]

  const browsers = [
    { value: 'all', label: 'All Browsers' },
    { value: 'chrome', label: 'Chrome' },
    { value: 'safari', label: 'Safari' },
    { value: 'firefox', label: 'Firefox' },
    { value: 'edge', label: 'Edge' }
  ]

  const userTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'new', label: 'New Users' },
    { value: 'returning', label: 'Returning Users' },
    { value: 'premium', label: 'Premium Users' },
    { value: 'trial', label: 'Trial Users' }
  ]

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'page_view', label: 'Page Views' },
    { value: 'user_action', label: 'User Actions' },
    { value: 'conversion', label: 'Conversions' },
    { value: 'auth', label: 'Authentication' },
    { value: 'error', label: 'Errors' }
  ]

  return (
    <div className="space-y-3">
      {/* Primary Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events, users, pages..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-48 justify-start text-left font-normal",
                !filters.dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                    {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={filters.dateRange}
              onSelect={(range) => updateFilter('dateRange', range || { from: undefined, to: undefined })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Quick Event Type Filter */}
        <Select value={filters.eventType} onValueChange={(value) => updateFilter('eventType', value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Expand/Collapse Advanced Filters */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          {isExpanded ? 'Less' : 'More'} Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 p-4 bg-gray-50 rounded-lg">
          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Location
            </label>
            <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Device Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              Device
            </label>
            <Select value={filters.device} onValueChange={(value) => updateFilter('device', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.value} value={device.value}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Browser Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Browser
            </label>
            <Select value={filters.browser} onValueChange={(value) => updateFilter('browser', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {browsers.map((browser) => (
                  <SelectItem key={browser.value} value={browser.value}>
                    {browser.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              User Type
            </label>
            <Select value={filters.userType} onValueChange={(value) => updateFilter('userType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.search}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date Range
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('dateRange', { from: undefined, to: undefined })}
              />
            </Badge>
          )}
          
          {filters.location !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {locations.find(l => l.value === filters.location)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('location', 'all')}
              />
            </Badge>
          )}
          
          {filters.device !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {devices.find(d => d.value === filters.device)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('device', 'all')}
              />
            </Badge>
          )}
          
          {filters.browser !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {browsers.find(b => b.value === filters.browser)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('browser', 'all')}
              />
            </Badge>
          )}
          
          {filters.userType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {userTypes.find(u => u.value === filters.userType)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('userType', 'all')}
              />
            </Badge>
          )}
          
          {filters.eventType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {eventTypes.find(e => e.value === filters.eventType)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('eventType', 'all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}