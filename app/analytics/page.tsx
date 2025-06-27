'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Note: Tabs component is not implemented yet - using simple state-based tabs
import { useAnalytics } from '@/lib/hooks/useAnalytics';

// Import our analytics components
import UserJourneyMap from '@/components/analytics/UserJourneyMap';
import SessionAnalytics from '@/components/analytics/SessionAnalytics';
import FeatureUsageChart from '@/components/analytics/FeatureUsageChart';
import RealTimeUserActivity from '@/components/analytics/RealTimeUserActivity';

import { 
  BarChart3, 
  Users, 
  Activity, 
  Eye,
  MousePointer,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState(7);
  const [demoUserId, setDemoUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('realtime');
  
  // Initialize analytics tracking for this page
  const analytics = useAnalytics({
    userId: demoUserId || undefined,
    autoTrackPageViews: true,
  });

  // Demo tracking functions
  const trackDemoFeature = (featureName: string) => {
    analytics.trackFeatureUsage(featureName, 'demo_click', {
      source: 'analytics_page',
      timestamp: new Date().toISOString(),
    });
  };

  const trackDemoForm = () => {
    analytics.trackFormStart('demo_form', {
      formType: 'analytics_demo',
    });
    
    // Simulate form submission after a delay
    setTimeout(() => {
      analytics.trackFormSubmit('demo_form', {
        formType: 'analytics_demo',
        success: true,
      });
    }, 1000);
  };

  const trackDemoClick = (element: string) => {
    analytics.trackClick(element, {
      page: '/analytics',
      section: 'demo',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive user behavior tracking and analytics system
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-2">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(parseInt(e.target.value))}
              className="p-2 border rounded-md"
            >
              <option value={1}>Last 24 hours</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Demo User ID</label>
            <input
              type="text"
              value={demoUserId}
              onChange={(e) => setDemoUserId(e.target.value)}
              placeholder="Enter user ID for demo"
              className="p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Demo Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Demo Analytics Tracking
          </CardTitle>
          <CardDescription>
            Try these actions to see analytics tracking in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => trackDemoFeature('dashboard')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Track Dashboard Feature
            </Button>
            <Button
              onClick={() => trackDemoFeature('user_management')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Track User Management
            </Button>
            <Button
              onClick={() => trackDemoClick('demo_button')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MousePointer className="h-4 w-4" />
              Track Click Event
            </Button>
            <Button
              onClick={trackDemoForm}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Track Form Interaction
            </Button>
            <Button
              onClick={() => analytics.trackError('demo_error', { type: 'simulated' })}
              variant="destructive"
              className="flex items-center gap-2"
            >
              Track Error Event
            </Button>
          </div>
          
          {analytics.sessionId && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Session:</strong> {analytics.sessionId}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Analytics events are being tracked automatically for this session
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <div className="space-y-6">
        <div className="grid w-full grid-cols-4 gap-2">
          {[
            { key: 'realtime', label: 'Real-Time', icon: Activity },
            { key: 'sessions', label: 'Sessions', icon: Clock },
            { key: 'features', label: 'Features', icon: TrendingUp },
            { key: 'journeys', label: 'User Journeys', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'outline'}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {activeTab === 'realtime' && (
          <div className="space-y-6">
            <RealTimeUserActivity
              refreshInterval={5000}
              maxRecentEvents={50}
            />
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <SessionAnalytics
              timeRange={selectedTimeRange}
              userId={demoUserId || undefined}
            />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-6">
            <FeatureUsageChart
              timeRange={selectedTimeRange}
              userId={demoUserId || undefined}
            />
          </div>
        )}

        {activeTab === 'journeys' && (
          <div className="space-y-6">
            <UserJourneyMap
              userId={demoUserId || undefined}
              timeRange={selectedTimeRange}
            />
          </div>
        )}
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics System Information</CardTitle>
          <CardDescription>
            Technical details about the analytics implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Features Implemented</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  ✅ <span>Real-time event tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  ✅ <span>Session management</span>
                </li>
                <li className="flex items-center gap-2">
                  ✅ <span>Page view tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  ✅ <span>Feature usage analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  ✅ <span>User journey mapping</span>
                </li>
                <li className="flex items-center gap-2">
                  ✅ <span>Form interaction tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  ✅ <span>Error event logging</span>
                </li>
                <li className="flex items-center gap-2">
                  ✅ <span>Device and browser detection</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">API Endpoints</h4>
              <ul className="space-y-2 text-sm font-mono">
                <li className="bg-gray-100 p-2 rounded">
                  POST /api/analytics/track
                </li>
                <li className="bg-gray-100 p-2 rounded">
                  POST /api/analytics/sessions
                </li>
                <li className="bg-gray-100 p-2 rounded">
                  GET /api/analytics/user-behavior
                </li>
                <li className="bg-gray-100 p-2 rounded">
                  GET /api/analytics/events
                </li>
              </ul>
              
              <h4 className="font-semibold mb-3 mt-6">Database Models</h4>
              <ul className="space-y-2 text-sm font-mono">
                <li className="bg-gray-100 p-2 rounded">AnalyticsEvent</li>
                <li className="bg-gray-100 p-2 rounded">UserSession</li>
                <li className="bg-gray-100 p-2 rounded">PageView</li>
                <li className="bg-gray-100 p-2 rounded">FeatureUsage</li>
                <li className="bg-gray-100 p-2 rounded">UserJourney</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}