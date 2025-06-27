# Advanced User Behavior Tracking System

This comprehensive analytics system provides detailed tracking of user behavior, session management, and real-time monitoring for the Zenith MVP platform.

## 🏗️ System Architecture

### Database Models
- **AnalyticsEvent**: Core event tracking with flexible properties
- **UserSession**: Session management with device/browser detection
- **PageView**: Page-specific analytics with duration tracking
- **FeatureUsage**: Feature adoption and usage patterns
- **UserJourney**: User progression through application stages

### API Endpoints
- `POST /api/analytics/track` - Event tracking
- `POST /api/analytics/sessions` - Session management
- `GET /api/analytics/user-behavior` - User journey analytics
- `GET /api/analytics/events` - Event querying and filtering

## 🚀 Quick Start

### 1. Wrap Your App with Analytics Provider

```tsx
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

function App() {
  return (
    <AnalyticsProvider userId={user?.id} autoTrackPageViews={true}>
      <YourAppContent />
    </AnalyticsProvider>
  );
}
```

### 2. Use the Analytics Hook

```tsx
import { useAnalytics } from '@/lib/hooks/useAnalytics';

function YourComponent() {
  const analytics = useAnalytics();

  const handleFeatureClick = () => {
    analytics.trackFeatureUsage('dashboard', 'view_charts', {
      chartType: 'line',
      dataRange: '30days'
    });
  };

  return <button onClick={handleFeatureClick}>View Charts</button>;
}
```

### 3. Track Form Interactions

```tsx
import { TrackableForm } from '@/components/analytics/AnalyticsProvider';

function LoginForm() {
  return (
    <TrackableForm 
      formName="login" 
      onSubmit={handleLogin}
    >
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit">Login</button>
    </TrackableForm>
  );
}
```

## 📊 Analytics Components

### Real-Time User Activity
```tsx
import RealTimeUserActivity from '@/components/analytics/RealTimeUserActivity';

<RealTimeUserActivity 
  refreshInterval={5000}
  maxRecentEvents={50}
/>
```

### User Journey Mapping
```tsx
import UserJourneyMap from '@/components/analytics/UserJourneyMap';

<UserJourneyMap 
  userId={userId}
  timeRange={7}
/>
```

### Session Analytics
```tsx
import SessionAnalytics from '@/components/analytics/SessionAnalytics';

<SessionAnalytics 
  timeRange={30}
  userId={userId}
/>
```

### Feature Usage Charts
```tsx
import FeatureUsageChart from '@/components/analytics/FeatureUsageChart';

<FeatureUsageChart 
  timeRange={30}
  featureFilter="dashboard"
/>
```

## 🎯 Event Tracking Patterns

### Page Views (Automatic)
```tsx
// Automatically tracked when using AnalyticsProvider
// Manual tracking:
analytics.trackPageView('/dashboard', 'Dashboard - Zenith');
```

### Feature Usage
```tsx
// Track feature interactions
analytics.trackFeatureUsage('billing', 'view_invoices', {
  invoiceCount: 5,
  dateRange: 'last_30_days'
});

// Track feature adoption
analytics.trackFeatureUsage('ai_assistant', 'first_use', {
  onboardingStep: 3
});
```

### Form Interactions
```tsx
// Form start (user begins filling)
analytics.trackFormStart('contact_form', {
  source: 'landing_page'
});

// Form submission
analytics.trackFormSubmit('contact_form', {
  fields_completed: 5,
  validation_errors: 0
});

// Form abandonment
analytics.trackFormAbandon('contact_form', {
  fields_completed: 2,
  time_spent: 45 // seconds
});
```

### Custom Events
```tsx
// Custom business events
analytics.track({
  eventType: 'conversion',
  eventName: 'subscription_upgrade',
  properties: {
    from_plan: 'basic',
    to_plan: 'premium',
    revenue: 29.99
  }
});
```

### Error Tracking
```tsx
// Track application errors
analytics.trackError('api_request_failed', {
  endpoint: '/api/billing/invoices',
  status_code: 500,
  error_message: 'Internal server error'
});
```

## 🔧 Advanced Usage

### Higher-Order Components

#### Form Analytics Wrapper
```tsx
const AnalyticsContactForm = withFormAnalytics(ContactForm, 'contact_form');

// Usage
<AnalyticsContactForm 
  onFormStart={() => console.log('Form started')}
  onFormSubmit={(data) => console.log('Form submitted', data)}
/>
```

#### Feature Analytics Wrapper
```tsx
const AnalyticsDashboard = withFeatureAnalytics(Dashboard, 'main_dashboard');

// Automatically tracks mount/unmount and feature actions
<AnalyticsDashboard 
  onFeatureAction={(action, metadata) => {
    console.log('Feature action:', action, metadata);
  }}
/>
```

### Trackable Components

#### Trackable Buttons
```tsx
import { TrackableButton } from '@/components/analytics/AnalyticsProvider';

<TrackableButton
  trackingId="upgrade_cta"
  metadata={{ location: 'header', plan: 'premium' }}
  onClick={handleUpgrade}
  className="btn-primary"
>
  Upgrade Now
</TrackableButton>
```

#### Trackable Sections
```tsx
import { TrackableSection } from '@/components/analytics/AnalyticsProvider';

<TrackableSection sectionName="pricing_table">
  <PricingTable />
</TrackableSection>
```

### Scroll Depth Tracking
```tsx
import { useScrollTracking } from '@/components/analytics/AnalyticsProvider';

function BlogPost() {
  const scrollDepth = useScrollTracking('blog_post_analytics');
  
  return (
    <article>
      <h1>Blog Post Title</h1>
      <div>Scroll depth: {scrollDepth}%</div>
      {/* Content */}
    </article>
  );
}
```

## 📈 Analytics Queries

### Get User Behavior Data
```typescript
const behaviorData = await fetch('/api/analytics/user-behavior?userId=123&days=30');
// Returns: events, sessions, pageViews, featureUsage, journeys
```

### Get Feature Adoption
```typescript
const adoptionData = await fetch('/api/analytics/events', {
  method: 'POST',
  body: JSON.stringify({
    type: 'feature_adoption',
    days: 30
  })
});
```

### Get Conversion Funnel
```typescript
const funnelData = await fetch('/api/analytics/events', {
  method: 'POST',
  body: JSON.stringify({
    type: 'conversion_funnel',
    steps: ['signup', 'trial_start', 'upgrade', 'active_user'],
    days: 30
  })
});
```

### Get Real-Time Active Users
```typescript
const activeUsers = await fetch('/api/analytics/events', {
  method: 'POST',
  body: JSON.stringify({
    type: 'active_users',
    minutes: 5
  })
});
```

## 🔐 Privacy & Performance

### Privacy Considerations
- All tracking respects user privacy settings
- No personally identifiable information is tracked without consent
- IP addresses are optionally stored and can be anonymized
- GDPR and CCPA compliant data handling

### Performance Optimizations
- **Batching**: Events are batched and sent periodically
- **Async Processing**: All tracking is non-blocking
- **Error Resilience**: Analytics failures don't break the app
- **Local Storage**: Session data cached locally
- **Compression**: Event payloads are optimized for size

### Configuration Options
```typescript
const analytics = useAnalytics({
  userId: 'user123',
  autoTrackPageViews: true,
  batchSize: 10,           // Events per batch
  flushInterval: 5000,     // Milliseconds between flushes
});
```

## 🧪 Testing Analytics

### Unit Tests
```typescript
import { AnalyticsService } from '@/lib/analytics-service';

test('tracks feature usage', async () => {
  const event = await AnalyticsService.trackFeatureUsage({
    featureName: 'dashboard',
    action: 'view',
    metadata: { test: true }
  }, 'session123', 'user123');
  
  expect(event).toBeDefined();
  expect(event.featureName).toBe('dashboard');
});
```

### Integration Tests
```typescript
test('analytics provider tracks page views', () => {
  render(
    <AnalyticsProvider>
      <TestComponent />
    </AnalyticsProvider>
  );
  
  // Verify tracking calls were made
  expect(mockTrackPageView).toHaveBeenCalled();
});
```

## 📱 Mobile Tracking

### Device Detection
```typescript
// Automatic device type detection
const deviceInfo = AnalyticsService.parseUserAgent(navigator.userAgent);
// Returns: { deviceType: 'mobile', browser: 'Chrome', os: 'iOS' }
```

### Touch Events
```typescript
// Track mobile-specific interactions
analytics.track({
  eventType: 'engagement',
  eventName: 'touch_gesture',
  properties: {
    gesture: 'swipe',
    direction: 'left',
    element: 'image_gallery'
  }
});
```

## 🚀 Deployment Checklist

1. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Environment Variables**
   - Ensure DATABASE_URL is configured
   - Set up Redis for session storage (optional)

3. **API Routes**
   - Verify all analytics endpoints are deployed
   - Test with sample data

4. **Frontend Integration**
   - Wrap main app with AnalyticsProvider
   - Add tracking to key user flows

5. **Monitoring**
   - Set up error tracking for analytics failures
   - Monitor API performance and response times

This analytics system provides enterprise-grade user behavior tracking while maintaining simplicity and performance. It's designed to scale with your application and provide actionable insights for product development and user experience optimization.