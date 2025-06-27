'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalyticsEventType } from '@prisma/client';

interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  eventName: string;
  properties?: Record<string, any>;
  page?: string;
  referrer?: string;
}

interface AnalyticsHookOptions {
  userId?: string;
  autoTrackPageViews?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

interface AnalyticsHook {
  sessionId: string | null;
  track: (event: AnalyticsEvent) => void;
  trackPageView: (page?: string, title?: string) => void;
  trackFeatureUsage: (featureName: string, action: string, metadata?: Record<string, any>) => void;
  trackFormStart: (formName: string, metadata?: Record<string, any>) => void;
  trackFormSubmit: (formName: string, metadata?: Record<string, any>) => void;
  trackFormAbandon: (formName: string, metadata?: Record<string, any>) => void;
  trackClick: (element: string, metadata?: Record<string, any>) => void;
  trackError: (error: string, metadata?: Record<string, any>) => void;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  flush: () => Promise<void>;
}

export function useAnalytics(options: AnalyticsHookOptions = {}): AnalyticsHook {
  const {
    userId,
    autoTrackPageViews = true,
    batchSize = 10,
    flushInterval = 5000,
  } = options;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pageStartTime = useRef<number>(Date.now());
  const currentPage = useRef<string>('');

  // Generate or retrieve session ID
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('analytics_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      sessionStorage.setItem('analytics_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Auto-track page views
  useEffect(() => {
    if (autoTrackPageViews && sessionId) {
      const currentPath = window.location.pathname;
      if (currentPath !== currentPage.current) {
        // Track time spent on previous page
        if (currentPage.current) {
          trackPageView(currentPage.current, document.title, Date.now() - pageStartTime.current);
        }
        
        // Update current page and start time
        currentPage.current = currentPath;
        pageStartTime.current = Date.now();
        
        // Track new page view
        trackPageView(currentPath, document.title);
      }
    }
  }, [sessionId, autoTrackPageViews]);

  // Start session on mount
  useEffect(() => {
    if (sessionId) {
      startSession();
    }
  }, [sessionId]);

  // Setup periodic flush
  useEffect(() => {
    const setupFlush = () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushTimeoutRef.current = setTimeout(() => {
        flush();
        setupFlush();
      }, flushInterval);
    };

    setupFlush();

    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, [flushInterval]);

  // Flush on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flush();
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const generateSessionId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const queueEvent = useCallback((event: AnalyticsEvent) => {
    eventQueue.current.push({
      ...event,
      page: event.page || window.location.pathname,
      referrer: event.referrer || document.referrer,
    });

    if (eventQueue.current.length >= batchSize) {
      flush();
    }
  }, [batchSize]);

  const track = useCallback((event: AnalyticsEvent) => {
    queueEvent(event);
  }, [queueEvent]);

  const trackPageView = useCallback((page?: string, title?: string, duration?: number) => {
    const eventData: AnalyticsEvent = {
      eventType: 'page_view',
      eventName: 'page_view',
      properties: {
        title: title || document.title,
        duration,
      },
      page: page || window.location.pathname,
    };

    // Send page view immediately (don't queue)
    sendEvent(eventData);
    
    // Also send to page view API
    if (sessionId) {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: page || window.location.pathname,
          title: title || document.title,
          duration,
          referrer: document.referrer,
          sessionId,
          userId,
        }),
      }).catch(console.error);
    }
  }, [sessionId, userId]);

  const trackFeatureUsage = useCallback((featureName: string, action: string, metadata?: Record<string, any>) => {
    track({
      eventType: 'feature_usage',
      eventName: `feature_${featureName}_${action}`,
      properties: {
        featureName,
        action,
        ...metadata,
      },
    });
  }, [track]);

  const trackFormStart = useCallback((formName: string, metadata?: Record<string, any>) => {
    track({
      eventType: 'form_start',
      eventName: `form_start_${formName}`,
      properties: {
        formName,
        ...metadata,
      },
    });
  }, [track]);

  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, any>) => {
    track({
      eventType: 'form_submit',
      eventName: `form_submit_${formName}`,
      properties: {
        formName,
        ...metadata,
      },
    });
  }, [track]);

  const trackFormAbandon = useCallback((formName: string, metadata?: Record<string, any>) => {
    track({
      eventType: 'form_abandon',
      eventName: `form_abandon_${formName}`,
      properties: {
        formName,
        ...metadata,
      },
    });
  }, [track]);

  const trackClick = useCallback((element: string, metadata?: Record<string, any>) => {
    track({
      eventType: 'click',
      eventName: `click_${element}`,
      properties: {
        element,
        ...metadata,
      },
    });
  }, [track]);

  const trackError = useCallback((error: string, metadata?: Record<string, any>) => {
    track({
      eventType: 'error',
      eventName: 'error_occurred',
      properties: {
        error,
        ...metadata,
      },
    });
  }, [track]);

  const startSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/analytics/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          entryPage: window.location.pathname,
          referrer: document.referrer,
          ...extractUtmParams(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to start analytics session');
      }
    } catch (error) {
      console.error('Error starting analytics session:', error);
    }
  }, [sessionId, userId]);

  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await fetch('/api/analytics/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          exitPage: window.location.pathname,
        }),
      });
    } catch (error) {
      console.error('Error ending analytics session:', error);
    }
  }, [sessionId]);

  const sendEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          sessionId,
          userId,
        }),
      });
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }
  }, [sessionId, userId]);

  const flush = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    try {
      await fetch('/api/analytics/track', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: events.map(event => ({
            ...event,
            sessionId,
            userId,
          })),
        }),
      });
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Re-queue events on error
      eventQueue.current.unshift(...events);
    }
  }, [sessionId, userId]);

  const extractUtmParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
    };
  };

  return {
    sessionId,
    track,
    trackPageView,
    trackFeatureUsage,
    trackFormStart,
    trackFormSubmit,
    trackFormAbandon,
    trackClick,
    trackError,
    startSession,
    endSession,
    flush,
  };
}