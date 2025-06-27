'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Eye, 
  MousePointer, 
  Smartphone, 
  Monitor, 
  Tablet,
  Globe,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SessionMetrics {
  totalSessions: number;
  averageDuration: number;
  totalPageViews: number;
  averagePageViews: number;
  bounceRate: number;
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  browserBreakdown: { browser: string; count: number; percentage: number }[];
  hourlyActivity: { hour: number; sessions: number; pageViews: number }[];
  topPages: { page: string; views: number; avgDuration: number }[];
  sessionTrends: { date: string; sessions: number; avgDuration: number }[];
}

interface SessionAnalyticsProps {
  timeRange?: number; // days
  userId?: string;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SessionAnalytics({
  timeRange = 7,
  userId,
  className = '',
}: SessionAnalyticsProps) {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'devices' | 'activity' | 'pages'>('overview');

  useEffect(() => {
    fetchSessionMetrics();
  }, [timeRange, userId]);

  const fetchSessionMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/analytics/events?limit=1000`;
      if (userId) url += `&userId=${userId}`;

      // Fetch sessions data
      const sessionsResponse = await fetch(url);
      if (!sessionsResponse.ok) {
        throw new Error('Failed to fetch session data');
      }

      const sessionsData = await sessionsResponse.json();

      // Calculate metrics from the data
      const calculatedMetrics = calculateSessionMetrics(sessionsData);
      setMetrics(calculatedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateSessionMetrics = (data: any): SessionMetrics => {
    // This is a simplified calculation - in a real app, you'd want to fetch pre-aggregated data
    const sessions = data.events || [];
    const pageViews = sessions.filter((e: any) => e.eventType === 'page_view');

    // Group sessions by sessionId
    const sessionGroups = sessions.reduce((acc: any, event: any) => {
      if (!event.sessionId) return acc;
      if (!acc[event.sessionId]) {
        acc[event.sessionId] = {
          sessionId: event.sessionId,
          events: [],
          startTime: new Date(event.timestamp),
          endTime: new Date(event.timestamp),
          device: event.session?.deviceType || 'unknown',
          browser: event.session?.browser || 'unknown',
        };
      }
      acc[event.sessionId].events.push(event);
      const eventTime = new Date(event.timestamp);
      if (eventTime < acc[event.sessionId].startTime) {
        acc[event.sessionId].startTime = eventTime;
      }
      if (eventTime > acc[event.sessionId].endTime) {
        acc[event.sessionId].endTime = eventTime;
      }
      return acc;
    }, {});

    const sessionList = Object.values(sessionGroups) as any[];

    // Calculate basic metrics
    const totalSessions = sessionList.length;
    const totalDuration = sessionList.reduce((sum: number, session: any) => {
      return sum + (session.endTime.getTime() - session.startTime.getTime()) / 1000;
    }, 0);
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const totalPageViews = pageViews.length;
    const averagePageViews = totalSessions > 0 ? totalPageViews / totalSessions : 0;

    // Calculate bounce rate (sessions with only 1 page view)
    const singlePageSessions = sessionList.filter(session => 
      session.events.filter((e: any) => e.eventType === 'page_view').length <= 1
    ).length;
    const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0;

    // Device breakdown
    const deviceCounts = sessionList.reduce((acc: any, session: any) => {
      acc[session.device] = (acc[session.device] || 0) + 1;
      return acc;
    }, {});
    const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]: [string, any]) => ({
      device,
      count,
      percentage: (count / totalSessions) * 100,
    }));

    // Browser breakdown
    const browserCounts = sessionList.reduce((acc: any, session: any) => {
      acc[session.browser] = (acc[session.browser] || 0) + 1;
      return acc;
    }, {});
    const browserBreakdown = Object.entries(browserCounts).map(([browser, count]: [string, any]) => ({
      browser,
      count,
      percentage: (count / totalSessions) * 100,
    }));

    // Hourly activity
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
      const hourSessions = sessionList.filter(session => 
        session.startTime.getHours() === hour
      ).length;
      const hourPageViews = pageViews.filter((pv: any) => 
        new Date(pv.timestamp).getHours() === hour
      ).length;
      return { hour, sessions: hourSessions, pageViews: hourPageViews };
    });

    // Top pages
    const pageCounts = pageViews.reduce((acc: any, pv: any) => {
      if (!acc[pv.page]) {
        acc[pv.page] = { views: 0, totalDuration: 0 };
      }
      acc[pv.page].views += 1;
      acc[pv.page].totalDuration += pv.properties?.duration || 0;
      return acc;
    }, {});
    const topPages = Object.entries(pageCounts)
      .map(([page, data]: [string, any]) => ({
        page,
        views: data.views,
        avgDuration: data.views > 0 ? data.totalDuration / data.views : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Session trends (simplified - would need proper date grouping)
    const sessionTrends = Array.from({ length: timeRange }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeRange - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessionList.filter(session => 
        session.startTime.toISOString().split('T')[0] === dateStr
      );
      
      const dayAvgDuration = daySessions.length > 0 
        ? daySessions.reduce((sum: number, session: any) => 
            sum + (session.endTime.getTime() - session.startTime.getTime()) / 1000, 0
          ) / daySessions.length
        : 0;

      return {
        date: dateStr,
        sessions: daySessions.length,
        avgDuration: dayAvgDuration,
      };
    });

    return {
      totalSessions,
      averageDuration,
      totalPageViews,
      averagePageViews,
      bounceRate,
      deviceBreakdown,
      browserBreakdown,
      hourlyActivity,
      topPages,
      sessionTrends,
    };
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Session Analytics</CardTitle>
          <CardDescription>Loading session data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Session Analytics</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>{error || 'No data available'}</p>
            <Button onClick={fetchSessionMetrics} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Session Analytics
          </CardTitle>
          <CardDescription>
            Detailed analysis of user sessions and engagement patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* View Toggle */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'devices', label: 'Devices & Browsers' },
              { key: 'activity', label: 'Activity Patterns' },
              { key: 'pages', label: 'Page Analytics' },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={selectedView === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView(key as any)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Overview */}
          {selectedView === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    {getTrendIcon(metrics.totalSessions, metrics.totalSessions * 0.9)}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{metrics.totalSessions}</div>
                  <div className="text-sm text-blue-800">Total Sessions</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    {getTrendIcon(metrics.averagePageViews, metrics.averagePageViews * 0.9)}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.averagePageViews.toFixed(1)}
                  </div>
                  <div className="text-sm text-green-800">Avg Pages/Session</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    {getTrendIcon(metrics.averageDuration, metrics.averageDuration * 0.9)}
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDuration(metrics.averageDuration)}
                  </div>
                  <div className="text-sm text-purple-800">Avg Duration</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <MousePointer className="h-5 w-5 text-orange-600" />
                    {getTrendIcon(100 - metrics.bounceRate, 100 - metrics.bounceRate * 1.1)}
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics.bounceRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-orange-800">Bounce Rate</div>
                </div>
              </div>

              {/* Session Trends */}
              <div>
                <h4 className="font-semibold mb-4">Session Trends</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.sessionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        name="Sessions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Devices & Browsers */}
          {selectedView === 'devices' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <div>
                  <h4 className="font-semibold mb-4">Device Types</h4>
                  <div className="space-y-3">
                    {metrics.deviceBreakdown.map((device, index) => (
                      <div key={device.device} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(device.device)}
                          <span className="font-medium capitalize">{device.device}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{device.count}</div>
                          <div className="text-sm text-gray-500">{device.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Browser Breakdown */}
                <div>
                  <h4 className="font-semibold mb-4">Browsers</h4>
                  <div className="space-y-3">
                    {metrics.browserBreakdown.slice(0, 5).map((browser, index) => (
                      <div key={browser.browser} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4" />
                          <span className="font-medium">{browser.browser}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{browser.count}</div>
                          <div className="text-sm text-gray-500">{browser.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Device Chart */}
              <div>
                <h4 className="font-semibold mb-4">Device Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, percentage }) => `${device}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {metrics.deviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Activity Patterns */}
          {selectedView === 'activity' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Hourly Activity</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.hourlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#0088FE" name="Sessions" />
                      <Bar dataKey="pageViews" fill="#00C49F" name="Page Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Peak Hours */}
              <div>
                <h4 className="font-semibold mb-4">Peak Activity Hours</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.hourlyActivity
                    .sort((a, b) => b.sessions - a.sessions)
                    .slice(0, 4)
                    .map((hour) => (
                      <div key={hour.hour} className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {hour.hour}:00
                        </div>
                        <div className="text-sm text-gray-600">
                          {hour.sessions} sessions
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Page Analytics */}
          {selectedView === 'pages' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Top Pages</h4>
                <div className="space-y-3">
                  {metrics.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium truncate">{page.page}</div>
                        <div className="text-sm text-gray-500">
                          {page.views} views • Avg time: {formatDuration(page.avgDuration)}
                        </div>
                      </div>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}