'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ArrowRight, User, Clock, MousePointer, Eye, AlertCircle } from 'lucide-react';

interface JourneyStep {
  id: string;
  timestamp: Date;
  page: string;
  eventType: string;
  eventName: string;
  properties?: Record<string, any>;
  duration?: number;
}

interface UserJourneyData {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: JourneyStep[];
  deviceType?: string;
  browser?: string;
  entryPage?: string;
  exitPage?: string;
  totalPageViews: number;
  totalEvents: number;
}

interface UserJourneyMapProps {
  userId?: string;
  sessionId?: string;
  timeRange?: number; // days
  className?: string;
}

export default function UserJourneyMap({
  userId,
  sessionId,
  timeRange = 7,
  className = '',
}: UserJourneyMapProps) {
  const [journeyData, setJourneyData] = useState<UserJourneyData[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<UserJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'abandoned'>('all');

  useEffect(() => {
    fetchJourneyData();
  }, [userId, sessionId, timeRange]);

  const fetchJourneyData = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/analytics/user-behavior?days=${timeRange}`;
      if (userId) url += `&userId=${userId}`;
      if (sessionId) url += `&sessionId=${sessionId}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch user journey data');
      }

      const data = await response.json();
      
      // Transform the data into journey format
      const journeys = transformToJourneyData(data);
      setJourneyData(journeys);
      
      if (journeys.length > 0) {
        setSelectedJourney(journeys[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const transformToJourneyData = (data: any): UserJourneyData[] => {
    if (!data.rawData) return [];

    // Group sessions and their events
    const journeys: UserJourneyData[] = data.rawData.sessions.map((session: any) => {
      const sessionEvents = data.rawData.events.filter(
        (event: any) => event.sessionId === session.sessionId
      );
      
      const sessionPageViews = data.rawData.pageViews.filter(
        (pageView: any) => pageView.sessionId === session.sessionId
      );

      // Combine and sort all events
      const allSteps: JourneyStep[] = [
        ...sessionEvents.map((event: any) => ({
          id: event.id,
          timestamp: new Date(event.timestamp),
          page: event.page || '',
          eventType: event.eventType,
          eventName: event.eventName,
          properties: event.properties,
        })),
        ...sessionPageViews.map((pageView: any) => ({
          id: pageView.id,
          timestamp: new Date(pageView.timestamp),
          page: pageView.page,
          eventType: 'page_view',
          eventName: 'page_view',
          properties: { title: pageView.title },
          duration: pageView.duration,
        })),
      ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return {
        userId: session.userId || '',
        sessionId: session.sessionId,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
        duration: session.duration,
        steps: allSteps,
        deviceType: session.deviceType,
        browser: session.browser,
        entryPage: session.entryPage,
        exitPage: session.exitPage,
        totalPageViews: sessionPageViews.length,
        totalEvents: sessionEvents.length,
      };
    });

    return journeys;
  };

  const filteredJourneys = journeyData.filter(journey => {
    switch (filterType) {
      case 'completed':
        return journey.endTime && journey.duration && journey.duration > 60; // More than 1 minute
      case 'abandoned':
        return !journey.endTime || (journey.duration && journey.duration < 60);
      default:
        return true;
    }
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'page_view':
        return <Eye className="h-4 w-4" />;
      case 'click':
        return <MousePointer className="h-4 w-4" />;
      case 'form_submit':
        return <ArrowRight className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <User className="h-4 w-4" />;
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Journey Map</CardTitle>
          <CardDescription>Loading journey data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Journey Map</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={fetchJourneyData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Journey Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Journey Map
          </CardTitle>
          <CardDescription>
            Visualize user interactions and behavior patterns across sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Filter Journeys</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Journeys</option>
                <option value="completed">Completed Sessions</option>
                <option value="abandoned">Abandoned Sessions</option>
              </select>
            </div>
            {filteredJourneys.length > 1 && (
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Select Journey</label>
                <select
                  value={selectedJourney?.sessionId || ''}
                  onChange={(e) => {
                    const journey = filteredJourneys.find(j => j.sessionId === e.target.value);
                    setSelectedJourney(journey || null);
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  {filteredJourneys.map((journey) => (
                    <option key={journey.sessionId} value={journey.sessionId}>
                      {journey.startTime.toLocaleDateString()} - {journey.deviceType} ({journey.steps.length} steps)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Journey Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filteredJourneys.length}</div>
              <div className="text-sm text-blue-800">Total Sessions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredJourneys.reduce((sum, j) => sum + j.totalPageViews, 0)}
              </div>
              <div className="text-sm text-green-800">Page Views</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredJourneys.reduce((sum, j) => sum + j.totalEvents, 0)}
              </div>
              <div className="text-sm text-purple-800">Total Events</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatDuration(
                  Math.round(
                    filteredJourneys.reduce((sum, j) => sum + (j.duration || 0), 0) / 
                    (filteredJourneys.length || 1)
                  )
                )}
              </div>
              <div className="text-sm text-orange-800">Avg Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Journey */}
      {selectedJourney && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Journey Details
            </CardTitle>
            <CardDescription>
              Session from {selectedJourney.startTime.toLocaleString()} 
              {selectedJourney.endTime && ` to ${selectedJourney.endTime.toLocaleString()}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Session Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Device:</strong> {selectedJourney.deviceType || 'Unknown'}
                </div>
                <div>
                  <strong>Browser:</strong> {selectedJourney.browser || 'Unknown'}
                </div>
                <div>
                  <strong>Entry Page:</strong> {selectedJourney.entryPage || 'N/A'}
                </div>
                <div>
                  <strong>Duration:</strong> {formatDuration(selectedJourney.duration)}
                </div>
              </div>
            </div>

            {/* Journey Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold">Journey Steps ({selectedJourney.steps.length})</h4>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {selectedJourney.steps.map((step, index) => (
                  <div key={step.id} className="relative flex items-start pb-6">
                    {/* Timeline dot */}
                    <div className="absolute left-4 w-4 h-4 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                      {getEventIcon(step.eventType)}
                    </div>
                    
                    {/* Content */}
                    <div className="ml-12 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getEventTypeColor(step.eventType)}>
                          {step.eventType}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {step.timestamp.toLocaleTimeString()}
                        </span>
                        {step.duration && (
                          <span className="text-xs text-gray-400">
                            ({formatDuration(step.duration)})
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-white border rounded-lg p-3">
                        <div className="font-medium">{step.eventName}</div>
                        <div className="text-sm text-gray-600 mb-2">{step.page}</div>
                        
                        {step.properties && Object.keys(step.properties).length > 0 && (
                          <div className="text-xs text-gray-500">
                            <details>
                              <summary className="cursor-pointer">Properties</summary>
                              <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(step.properties, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredJourneys.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Journeys Found</h3>
            <p className="text-gray-500">
              No user journey data available for the selected filters and time range.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}