'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface AnalyticsContextType {
  track: (event: any) => void;
  trackPageView: (page?: string, title?: string) => void;
  trackFeatureUsage: (featureName: string, action: string, metadata?: Record<string, any>) => void;
  trackFormStart: (formName: string, metadata?: Record<string, any>) => void;
  trackFormSubmit: (formName: string, metadata?: Record<string, any>) => void;
  trackFormAbandon: (formName: string, metadata?: Record<string, any>) => void;
  trackClick: (element: string, metadata?: Record<string, any>) => void;
  trackError: (error: string, metadata?: Record<string, any>) => void;
  sessionId: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  userId?: string;
  autoTrackPageViews?: boolean;
}

export function AnalyticsProvider({ 
  children, 
  userId, 
  autoTrackPageViews = true 
}: AnalyticsProviderProps) {
  const analytics = useAnalytics({
    userId,
    autoTrackPageViews,
    batchSize: 10,
    flushInterval: 5000,
  });

  // Track page load
  useEffect(() => {
    analytics.trackFeatureUsage('page_load', 'view', {
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

// Higher-order component for automatic form tracking
export function withFormAnalytics<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  formName: string
) {
  return function FormAnalyticsWrapper(props: T) {
    const analytics = useAnalyticsContext();

    const enhancedProps = {
      ...props,
      onFormStart: () => {
        analytics.trackFormStart(formName);
        props.onFormStart?.();
      },
      onFormSubmit: (data: any) => {
        analytics.trackFormSubmit(formName, { data });
        props.onFormSubmit?.(data);
      },
      onFormError: (error: any) => {
        analytics.trackError(`form_error_${formName}`, { error });
        props.onFormError?.(error);
      },
    };

    return <WrappedComponent {...enhancedProps} />;
  };
}

// Higher-order component for automatic feature tracking
export function withFeatureAnalytics<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  featureName: string
) {
  return function FeatureAnalyticsWrapper(props: T) {
    const analytics = useAnalyticsContext();

    useEffect(() => {
      analytics.trackFeatureUsage(featureName, 'mount');
      
      return () => {
        analytics.trackFeatureUsage(featureName, 'unmount');
      };
    }, [analytics]);

    const enhancedProps = {
      ...props,
      onFeatureAction: (action: string, metadata?: Record<string, any>) => {
        analytics.trackFeatureUsage(featureName, action, metadata);
        props.onFeatureAction?.(action, metadata);
      },
    };

    return <WrappedComponent {...enhancedProps} />;
  };
}

// Component for tracking clicks
interface TrackableButtonProps {
  children: React.ReactNode;
  trackingId: string;
  onClick?: () => void;
  className?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export function TrackableButton({ 
  children, 
  trackingId, 
  onClick, 
  metadata,
  ...props 
}: TrackableButtonProps) {
  const analytics = useAnalyticsContext();

  const handleClick = () => {
    analytics.trackClick(trackingId, metadata);
    onClick?.();
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}

// Component for tracking form interactions
interface TrackableFormProps {
  children: React.ReactNode;
  formName: string;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  [key: string]: any;
}

export function TrackableForm({ 
  children, 
  formName, 
  onSubmit, 
  ...props 
}: TrackableFormProps) {
  const analytics = useAnalyticsContext();
  const [hasStarted, setHasStarted] = React.useState(false);

  const handleFormStart = () => {
    if (!hasStarted) {
      analytics.trackFormStart(formName);
      setHasStarted(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    analytics.trackFormSubmit(formName);
    onSubmit?.(e);
  };

  // Track form abandonment on unmount if started but not submitted
  useEffect(() => {
    return () => {
      if (hasStarted) {
        analytics.trackFormAbandon(formName);
      }
    };
  }, [analytics, formName, hasStarted]);

  return (
    <form 
      {...props} 
      onSubmit={handleSubmit}
      onFocus={handleFormStart}
      onChange={handleFormStart}
    >
      {children}
    </form>
  );
}

// Hook for manual tracking in components
export function useTracking() {
  const analytics = useAnalyticsContext();

  return {
    trackFeature: (featureName: string, action: string, metadata?: Record<string, any>) => {
      analytics.trackFeatureUsage(featureName, action, metadata);
    },
    trackClick: (element: string, metadata?: Record<string, any>) => {
      analytics.trackClick(element, metadata);
    },
    trackError: (error: string, metadata?: Record<string, any>) => {
      analytics.trackError(error, metadata);
    },
    trackCustomEvent: (eventName: string, properties?: Record<string, any>) => {
      analytics.track({
        eventType: 'custom',
        eventName,
        properties,
      });
    },
    sessionId: analytics.sessionId,
  };
}

// Component for tracking page sections
interface TrackableSectionProps {
  children: React.ReactNode;
  sectionName: string;
  className?: string;
}

export function TrackableSection({ children, sectionName, className }: TrackableSectionProps) {
  const analytics = useAnalyticsContext();
  const sectionRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            analytics.trackFeatureUsage('section_view', 'visible', {
              sectionName,
              intersectionRatio: entry.intersectionRatio,
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [analytics, sectionName]);

  return (
    <div ref={sectionRef} className={className} data-section={sectionName}>
      {children}
    </div>
  );
}

// Hook for tracking scroll depth
export function useScrollTracking(pageName: string) {
  const analytics = useAnalyticsContext();
  const [maxScrollDepth, setMaxScrollDepth] = React.useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

      if (scrollDepth > maxScrollDepth) {
        setMaxScrollDepth(scrollDepth);
        
        // Track scroll milestones
        if (scrollDepth >= 25 && maxScrollDepth < 25) {
          analytics.trackFeatureUsage('scroll_depth', '25_percent', { page: pageName });
        } else if (scrollDepth >= 50 && maxScrollDepth < 50) {
          analytics.trackFeatureUsage('scroll_depth', '50_percent', { page: pageName });
        } else if (scrollDepth >= 75 && maxScrollDepth < 75) {
          analytics.trackFeatureUsage('scroll_depth', '75_percent', { page: pageName });
        } else if (scrollDepth >= 90 && maxScrollDepth < 90) {
          analytics.trackFeatureUsage('scroll_depth', '90_percent', { page: pageName });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [analytics, pageName, maxScrollDepth]);

  return maxScrollDepth;
}