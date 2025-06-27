'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Clock, 
  MousePointer,
  Star,
  AlertCircle
} from 'lucide-react';

interface FeatureUsageData {
  featureName: string;
  totalUsage: number;
  uniqueUsers: number;
  averageUsagePerUser: number;
  adoptionRate: number;
  lastUsed: Date;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface FeatureUsageMetrics {
  totalFeatures: number;
  activeFeatures: number;
  totalUsageEvents: number;
  averageAdoptionRate: number;
  topFeatures: FeatureUsageData[];
  adoptionTrends: { date: string; [key: string]: any }[];
  usageBreakdown: { feature: string; usage: number; users: number }[];
  timeOfDayUsage: { hour: number; usage: number }[];
}

interface FeatureUsageChartProps {
  timeRange?: number; // days
  userId?: string;
  featureFilter?: string;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function FeatureUsageChart({
  timeRange = 7,
  userId,
  featureFilter,
  className = '',
}: FeatureUsageChartProps) {
  const [metrics, setMetrics] = useState<FeatureUsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'adoption' | 'trends' | 'users'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    fetchFeatureUsage();
  }, [selectedTimeRange, userId, featureFilter]);

  const fetchFeatureUsage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch feature adoption data
      const adoptionResponse = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feature_adoption',
          days: selectedTimeRange,
        }),
      });

      if (!adoptionResponse.ok) {
        throw new Error('Failed to fetch feature adoption data');
      }

      const adoptionData = await adoptionResponse.json();

      // Fetch detailed usage events
      let eventsUrl = `/api/analytics/events?eventType=feature_usage&limit=1000`;
      if (userId) eventsUrl += `&userId=${userId}`;
      if (featureFilter) eventsUrl += `&eventName=${featureFilter}`;

      const eventsResponse = await fetch(eventsUrl);
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch feature usage events');
      }

      const eventsData = await eventsResponse.json();

      // Calculate comprehensive metrics
      const calculatedMetrics = calculateFeatureMetrics(adoptionData.data, eventsData.events);
      setMetrics(calculatedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateFeatureMetrics = (adoptionData: any[], events: any[]): FeatureUsageMetrics => {
    // Extract feature usage events
    const featureEvents = events.filter(e => e.eventType === 'feature_usage');
    
    // Group by feature name
    const featureGroups = featureEvents.reduce((acc: any, event: any) => {
      const featureName = event.properties?.featureName || event.eventName.replace('feature_', '').split('_')[0];
      if (!acc[featureName]) {
        acc[featureName] = {
          events: [],
          users: new Set(),
          lastUsed: new Date(event.timestamp),
        };
      }
      acc[featureName].events.push(event);
      if (event.userId) acc[featureName].users.add(event.userId);
      
      const eventDate = new Date(event.timestamp);
      if (eventDate > acc[featureName].lastUsed) {
        acc[featureName].lastUsed = eventDate;
      }
      return acc;
    }, {});

    // Calculate feature usage data
    const topFeatures: FeatureUsageData[] = Object.entries(featureGroups).map(([featureName, data]: [string, any]) => {
      const totalUsage = data.events.length;
      const uniqueUsers = data.users.size;
      const averageUsagePerUser = uniqueUsers > 0 ? totalUsage / uniqueUsers : 0;
      
      // Simple adoption rate calculation (would be more sophisticated in real app)
      const totalUsers = new Set(featureEvents.map(e => e.userId).filter(Boolean)).size || 1;
      const adoptionRate = (uniqueUsers / totalUsers) * 100;

      // Calculate trend (simplified)
      const recentEvents = data.events.filter((e: any) => {
        const eventDate = new Date(e.timestamp);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return eventDate >= threeDaysAgo;
      });
      const olderEvents = data.events.filter((e: any) => {
        const eventDate = new Date(e.timestamp);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const sixDaysAgo = new Date();
        sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
        return eventDate >= sixDaysAgo && eventDate < threeDaysAgo;
      });

      let trend: 'up' | 'down' | 'stable' = 'stable';
      let trendPercentage = 0;
      
      if (olderEvents.length > 0) {
        const recentAvg = recentEvents.length / 3;
        const olderAvg = olderEvents.length / 3;
        trendPercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (trendPercentage > 5) trend = 'up';
        else if (trendPercentage < -5) trend = 'down';
      }

      return {
        featureName,
        totalUsage,
        uniqueUsers,
        averageUsagePerUser,
        adoptionRate,
        lastUsed: data.lastUsed,
        trend,
        trendPercentage: Math.abs(trendPercentage),
      };
    }).sort((a, b) => b.totalUsage - a.totalUsage);

    // Usage breakdown for charts
    const usageBreakdown = topFeatures.slice(0, 10).map(feature => ({
      feature: feature.featureName,
      usage: feature.totalUsage,
      users: feature.uniqueUsers,
    }));

    // Time of day usage
    const timeOfDayUsage = Array.from({ length: 24 }, (_, hour) => {
      const hourUsage = featureEvents.filter(event => 
        new Date(event.timestamp).getHours() === hour
      ).length;
      return { hour, usage: hourUsage };
    });

    // Adoption trends over time
    const adoptionTrends = Array.from({ length: selectedTimeRange }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (selectedTimeRange - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = featureEvents.filter(event => 
        event.timestamp.split('T')[0] === dateStr
      );
      
      const trend: any = { date: dateStr };
      topFeatures.slice(0, 5).forEach(feature => {
        const featureDayEvents = dayEvents.filter(event => 
          (event.properties?.featureName || event.eventName.includes(feature.featureName))
        );
        trend[feature.featureName] = featureDayEvents.length;
      });
      
      return trend;
    });

    return {
      totalFeatures: Object.keys(featureGroups).length,
      activeFeatures: topFeatures.filter(f => f.lastUsed > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
      totalUsageEvents: featureEvents.length,
      averageAdoptionRate: topFeatures.reduce((sum, f) => sum + f.adoptionRate, 0) / (topFeatures.length || 1),
      topFeatures,
      adoptionTrends,
      usageBreakdown,
      timeOfDayUsage,
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <MousePointer className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Feature Usage Analytics</CardTitle>
          <CardDescription>Loading feature usage data...</CardDescription>
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
          <CardTitle>Feature Usage Analytics</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error || 'No data available'}</p>
            <Button onClick={fetchFeatureUsage} className="mt-4">
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
            <Zap className="h-5 w-5" />
            Feature Usage Analytics
          </CardTitle>
          <CardDescription>
            Track feature adoption, usage patterns, and user engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Time Range</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">View</label>
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="overview">Overview</option>
                <option value="adoption">Adoption Rates</option>
                <option value="trends">Usage Trends</option>
                <option value="users">User Engagement</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Features</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.totalFeatures}</div>
              <div className="text-sm text-blue-700">{metrics.activeFeatures} active</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Usage Events</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{metrics.totalUsageEvents}</div>
              <div className="text-sm text-green-700">Total interactions</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Avg Adoption</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(metrics.averageAdoptionRate)}
              </div>
              <div className="text-sm text-purple-700">Across all features</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Top Feature</span>
              </div>
              <div className="text-lg font-bold text-orange-600 truncate">
                {metrics.topFeatures[0]?.featureName || 'N/A'}
              </div>
              <div className="text-sm text-orange-700">
                {metrics.topFeatures[0]?.totalUsage || 0} uses
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="grid gap-6">
          {/* Top Features List */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Ranking</CardTitle>
              <CardDescription>Features ranked by total usage and adoption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topFeatures.slice(0, 10).map((feature, index) => (
                  <div key={feature.featureName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{feature.featureName}</div>
                        <div className="text-sm text-gray-500">
                          {feature.uniqueUsers} users • {formatPercentage(feature.adoptionRate)} adoption
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">{feature.totalUsage}</div>
                        <div className="text-sm text-gray-500">total uses</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(feature.trend)}
                        <span className="text-sm text-gray-600">
                          {feature.trendPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.usageBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="feature" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#0088FE" name="Total Usage" />
                    <Bar dataKey="users" fill="#00C49F" name="Unique Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adoption Rates */}
      {selectedView === 'adoption' && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption Rates</CardTitle>
              <CardDescription>Percentage of users who have used each feature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.topFeatures.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ featureName, adoptionRate }) => `${featureName}: ${formatPercentage(adoptionRate)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="adoptionRate"
                    >
                      {metrics.topFeatures.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatPercentage(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Adoption Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metrics.topFeatures.slice(0, 6).map((feature, index) => (
                  <div key={feature.featureName} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium text-sm">{feature.featureName}</span>
                    </div>
                    <div className="text-2xl font-bold">{formatPercentage(feature.adoptionRate)}</div>
                    <div className="text-sm text-gray-600">{feature.uniqueUsers} users</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Trends */}
      {selectedView === 'trends' && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Trends</CardTitle>
              <CardDescription>Usage patterns over time for top features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.adoptionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {metrics.topFeatures.slice(0, 5).map((feature, index) => (
                      <Line
                        key={feature.featureName}
                        type="monotone"
                        dataKey={feature.featureName}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Time of Day Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Usage by Time of Day</CardTitle>
              <CardDescription>When features are used most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.timeOfDayUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="usage" 
                      stroke="#0088FE" 
                      fill="#0088FE" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Engagement */}
      {selectedView === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>User Engagement Patterns</CardTitle>
            <CardDescription>How users interact with features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Engagement Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.topFeatures.slice(0, 4).map((feature) => (
                  <div key={feature.featureName} className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-sm mb-2">{feature.featureName}</div>
                    <div className="text-2xl font-bold mb-1">
                      {feature.averageUsagePerUser.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">uses per user</div>
                  </div>
                ))}
              </div>

              {/* Detailed User Stats */}
              <div className="space-y-4">
                <h4 className="font-semibold">Feature Engagement Details</h4>
                {metrics.topFeatures.map((feature) => (
                  <div key={feature.featureName} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium">{feature.featureName}</h5>
                      <Badge className={
                        feature.adoptionRate > 50 ? 'bg-green-100 text-green-800' :
                        feature.adoptionRate > 25 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {formatPercentage(feature.adoptionRate)} adoption
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total Usage:</span>
                        <div className="font-semibold">{feature.totalUsage}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Unique Users:</span>
                        <div className="font-semibold">{feature.uniqueUsers}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Used:</span>
                        <div className="font-semibold">
                          {feature.lastUsed.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}