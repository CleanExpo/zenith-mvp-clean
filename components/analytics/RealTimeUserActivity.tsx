'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  Wifi,
  WifiOff,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface LiveUserActivity {
  sessionId: string;
  userId?: string;
  currentPage: string;
  lastActivity: Date;
  deviceType: string;
  browser: string;
  location?: string;
  isActive: boolean;
  timeOnPage: number;
  pageViews: number;
  totalEvents: number;
}

interface RecentEvent {
  id: string;
  sessionId: string;
  userId?: string;
  eventType: string;
  eventName: string;
  page: string;
  timestamp: Date;
  properties?: Record<string, any>;
}

interface ActivityMetrics {
  activeUsers: number;
  totalSessions: number;
  pageViewsPerMinute: number;
  eventsPerMinute: number;
  topPages: { page: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
}

interface RealTimeUserActivityProps {
  refreshInterval?: number; // milliseconds
  maxRecentEvents?: number;
  className?: string;
}

export default function RealTimeUserActivity({
  refreshInterval = 5000,
  maxRecentEvents = 50,
  className = '',
}: RealTimeUserActivityProps) {
  const [activeUsers, setActiveUsers] = useState<LiveUserActivity[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    activeUsers: 0,
    totalSessions: 0,
    pageViewsPerMinute: 0,
    eventsPerMinute: 0,
    topPages: [],
    deviceBreakdown: [],
  });
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchRealTimeData = useCallback(async () => {
    try {
      setError(null);

      // Fetch active users
      const activeUsersResponse = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'active_users',
          minutes: 5,
        }),
      });

      if (!activeUsersResponse.ok) {
        throw new Error('Failed to fetch active users');
      }

      const activeUsersData = await activeUsersResponse.json();

      // Fetch recent events
      const recentEventsResponse = await fetch(
        `/api/analytics/events?limit=${maxRecentEvents}&offset=0`
      );

      if (!recentEventsResponse.ok) {
        throw new Error('Failed to fetch recent events');
      }

      const eventsData = await recentEventsResponse.json();

      // Process and update state
      const processedUsers = processActiveUsers(eventsData.events);
      const processedEvents = processRecentEvents(eventsData.events);
      const calculatedMetrics = calculateMetrics(eventsData.events, processedUsers);

      setActiveUsers(processedUsers);
      setRecentEvents(processedEvents);
      setMetrics(calculatedMetrics);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [maxRecentEvents]);

  useEffect(() => {
    // Initial fetch
    fetchRealTimeData();

    // Set up interval if live updates are enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (isLive) {
      intervalId = setInterval(fetchRealTimeData, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLive, refreshInterval, fetchRealTimeData]);

  const processActiveUsers = (events: any[]): LiveUserActivity[] => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentEvents = events.filter(event => 
      new Date(event.timestamp) >= fiveMinutesAgo
    );

    // Group by session
    const sessionGroups = recentEvents.reduce((acc: any, event: any) => {
      if (!event.sessionId) return acc;
      
      if (!acc[event.sessionId]) {
        acc[event.sessionId] = {
          sessionId: event.sessionId,
          userId: event.userId,
          events: [],
          lastActivity: new Date(event.timestamp),
          deviceType: event.session?.deviceType || 'unknown',
          browser: event.session?.browser || 'unknown',
        };
      }
      
      acc[event.sessionId].events.push(event);
      const eventTime = new Date(event.timestamp);
      if (eventTime > acc[event.sessionId].lastActivity) {
        acc[event.sessionId].lastActivity = eventTime;
        acc[event.sessionId].currentPage = event.page || '/';
      }
      
      return acc;
    }, {});

    return Object.values(sessionGroups).map((session: any) => {
      const pageViews = session.events.filter((e: any) => e.eventType === 'page_view').length;
      const now = new Date();
      const timeOnPage = Math.floor((now.getTime() - session.lastActivity.getTime()) / 1000);
      const isActive = timeOnPage < 60; // Active if last activity was within 1 minute

      return {
        sessionId: session.sessionId,
        userId: session.userId,
        currentPage: session.currentPage || '/',
        lastActivity: session.lastActivity,
        deviceType: session.deviceType,
        browser: session.browser,
        isActive,
        timeOnPage,
        pageViews,
        totalEvents: session.events.length,
      };
    }).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  };

  const processRecentEvents = (events: any[]): RecentEvent[] => {
    return events
      .slice(0, maxRecentEvents)
      .map(event => ({
        id: event.id,
        sessionId: event.sessionId,
        userId: event.userId,
        eventType: event.eventType,
        eventName: event.eventName,
        page: event.page || '/',
        timestamp: new Date(event.timestamp),
        properties: event.properties,
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const calculateMetrics = (events: any[], users: LiveUserActivity[]): ActivityMetrics => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentEvents = events.filter(event => 
      new Date(event.timestamp) >= oneMinuteAgo
    );

    const pageViewsPerMinute = recentEvents.filter(e => e.eventType === 'page_view').length;
    const eventsPerMinute = recentEvents.length;

    // Top pages from recent activity
    const pageCounts = recentEvents.reduce((acc: any, event: any) => {
      const page = event.page || '/';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {});

    const topPages = Object.entries(pageCounts)
      .map(([page, count]: [string, any]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Device breakdown from active users
    const deviceCounts = users.reduce((acc: any, user: any) => {
      acc[user.deviceType] = (acc[user.deviceType] || 0) + 1;
      return acc;
    }, {});

    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([device, count]: [string, any]) => ({ device, count }));

    return {
      activeUsers: users.filter(u => u.isActive).length,
      totalSessions: users.length,
      pageViewsPerMinute,
      eventsPerMinute,
      topPages,
      deviceBreakdown,
    };
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view':
        return <Eye className="h-3 w-3" />;
      case 'click':
        return <MousePointer className="h-3 w-3" />;
      case 'form_submit':
        return <Activity className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'page_view':
        return 'bg-blue-100 text-blue-800';
      case 'click':
        return 'bg-green-100 text-green-800';
      case 'form_submit':
        return 'bg-purple-100 text-purple-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
  };

  const refreshData = () => {
    fetchRealTimeData();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Real-Time User Activity</CardTitle>
          <CardDescription>Loading live activity data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-Time User Activity
                {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
              </CardTitle>
              <CardDescription>
                Live monitoring of user activity and engagement
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLiveUpdates}
                className="flex items-center gap-2"
              >
                {isLive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status */}
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {isLive ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              Status: {isLive ? 'Live' : 'Paused'}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last updated: {formatTimeAgo(lastUpdate)}
            </div>
            {error && (
              <div className="text-red-600">
                Error: {error}
              </div>
            )}
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Active Users</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
              <div className="text-sm text-green-700">of {metrics.totalSessions} sessions</div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Page Views</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.pageViewsPerMinute}</div>
              <div className="text-sm text-blue-700">per minute</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Events</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{metrics.eventsPerMinute}</div>
              <div className="text-sm text-purple-700">per minute</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Top Page</span>
              </div>
              <div className="text-lg font-bold text-orange-600 truncate">
                {metrics.topPages[0]?.page || 'N/A'}
              </div>
              <div className="text-sm text-orange-700">
                {metrics.topPages[0]?.count || 0} views
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Users and Recent Events */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users ({activeUsers.length})
            </CardTitle>
            <CardDescription>Users active in the last 5 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeUsers.map((user) => (
                <div key={user.sessionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm font-medium truncate">
                        {user.userId ? `User ${user.userId.slice(-6)}` : 'Anonymous'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {user.deviceType}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {user.currentPage}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.pageViews} pages • {formatTimeAgo(user.lastActivity)}
                    </div>
                  </div>
                </div>
              ))}
              {activeUsers.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active users</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Events ({recentEvents.length})
            </CardTitle>
            <CardDescription>Latest user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className="flex-shrink-0">
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        className={`text-xs ${getEventTypeColor(event.eventType)}`}
                      >
                        {event.eventType}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm font-medium truncate">{event.eventName}</div>
                    <div className="text-xs text-gray-600 truncate">{event.page}</div>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent events</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Breakdown and Top Pages */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Active users by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.deviceBreakdown.map((device) => (
                <div key={device.device} className="flex items-center justify-between">
                  <span className="capitalize">{device.device}</span>
                  <Badge variant="secondary">{device.count}</Badge>
                </div>
              ))}
              {metrics.deviceBreakdown.length === 0 && (
                <p className="text-gray-500 text-sm">No device data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <span className="text-sm truncate">{page.page}</span>
                    </div>
                  </div>
                  <Badge>{page.count} views</Badge>
                </div>
              ))}
              {metrics.topPages.length === 0 && (
                <p className="text-gray-500 text-sm">No page data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}