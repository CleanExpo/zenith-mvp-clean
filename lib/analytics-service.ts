import { prisma } from './prisma';
import { AnalyticsEventType } from '@prisma/client';

export interface AnalyticsEventData {
  eventType: AnalyticsEventType;
  eventName: string;
  properties?: Record<string, any>;
  page?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
  region?: string;
  city?: string;
  entryPage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface PageViewData {
  page: string;
  title?: string;
  referrer?: string;
  duration?: number;
}

export interface FeatureUsageData {
  featureName: string;
  action: string;
  metadata?: Record<string, any>;
}

export interface UserJourneyData {
  journeyStage: 'awareness' | 'consideration' | 'trial' | 'purchase' | 'retention';
  touchpoint: string;
  action: string;
  metadata?: Record<string, any>;
}

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  static async trackEvent(
    data: AnalyticsEventData,
    sessionId?: string,
    userId?: string
  ) {
    try {
      const event = await prisma.analyticsEvent.create({
        data: {
          ...data,
          sessionId,
          userId,
          timestamp: new Date(),
        },
      });

      // Update session event count
      if (sessionId) {
        await this.updateSessionActivity(sessionId);
      }

      return event;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw - analytics should not break the app
      return null;
    }
  }

  /**
   * Create or update a user session
   */
  static async createSession(data: SessionData) {
    try {
      const session = await prisma.userSession.upsert({
        where: { sessionId: data.sessionId },
        update: {
          lastActivityAt: new Date(),
          isActive: true,
        },
        create: {
          ...data,
          startTime: new Date(),
          lastActivityAt: new Date(),
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  /**
   * End a user session
   */
  static async endSession(sessionId: string, exitPage?: string) {
    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionId },
      });

      if (!session) return null;

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

      const updatedSession = await prisma.userSession.update({
        where: { sessionId },
        data: {
          endTime,
          duration,
          exitPage,
          isActive: false,
        },
      });

      return updatedSession;
    } catch (error) {
      console.error('Error ending session:', error);
      return null;
    }
  }

  /**
   * Track a page view
   */
  static async trackPageView(
    data: PageViewData,
    sessionId?: string,
    userId?: string
  ) {
    try {
      const pageView = await prisma.pageView.create({
        data: {
          ...data,
          sessionId,
          userId,
          timestamp: new Date(),
        },
      });

      // Update session page view count
      if (sessionId) {
        await this.updateSessionPageViews(sessionId);
      }

      return pageView;
    } catch (error) {
      console.error('Error tracking page view:', error);
      return null;
    }
  }

  /**
   * Track feature usage
   */
  static async trackFeatureUsage(
    data: FeatureUsageData,
    sessionId?: string,
    userId?: string
  ) {
    try {
      const featureUsage = await prisma.featureUsage.create({
        data: {
          ...data,
          sessionId,
          userId,
          timestamp: new Date(),
        },
      });

      return featureUsage;
    } catch (error) {
      console.error('Error tracking feature usage:', error);
      return null;
    }
  }

  /**
   * Track user journey step
   */
  static async trackUserJourney(
    data: UserJourneyData,
    userId: string,
    sessionId?: string
  ) {
    try {
      const journey = await prisma.userJourney.create({
        data: {
          ...data,
          userId,
          sessionId,
          timestamp: new Date(),
        },
      });

      return journey;
    } catch (error) {
      console.error('Error tracking user journey:', error);
      return null;
    }
  }

  /**
   * Get user session analytics
   */
  static async getSessionAnalytics(sessionId: string) {
    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionId },
        include: {
          analyticsEvents: {
            orderBy: { timestamp: 'asc' },
          },
          sessionPageViews: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      return session;
    } catch (error) {
      console.error('Error getting session analytics:', error);
      return null;
    }
  }

  /**
   * Get user behavior analytics
   */
  static async getUserBehavior(userId: string, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [events, sessions, pageViews, featureUsage, journeys] = await Promise.all([
        prisma.analyticsEvent.findMany({
          where: {
            userId,
            timestamp: { gte: startDate },
          },
          orderBy: { timestamp: 'desc' },
        }),
        prisma.userSession.findMany({
          where: {
            userId,
            startTime: { gte: startDate },
          },
          orderBy: { startTime: 'desc' },
        }),
        prisma.pageView.findMany({
          where: {
            userId,
            timestamp: { gte: startDate },
          },
          orderBy: { timestamp: 'desc' },
        }),
        prisma.featureUsage.findMany({
          where: {
            userId,
            timestamp: { gte: startDate },
          },
          orderBy: { timestamp: 'desc' },
        }),
        prisma.userJourney.findMany({
          where: {
            userId,
            timestamp: { gte: startDate },
          },
          orderBy: { timestamp: 'desc' },
        }),
      ]);

      return {
        events,
        sessions,
        pageViews,
        featureUsage,
        journeys,
      };
    } catch (error) {
      console.error('Error getting user behavior:', error);
      return null;
    }
  }

  /**
   * Get feature adoption analytics
   */
  static async getFeatureAdoption(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const featureUsage = await prisma.featureUsage.groupBy({
        by: ['featureName'],
        where: {
          timestamp: { gte: startDate },
        },
        _count: {
          id: true,
        },
      });

      return featureUsage;
    } catch (error) {
      console.error('Error getting feature adoption:', error);
      return [];
    }
  }

  /**
   * Get real-time active users
   */
  static async getActiveUsers(minutes = 5) {
    try {
      const cutoff = new Date();
      cutoff.setMinutes(cutoff.getMinutes() - minutes);

      const activeUsers = await prisma.userSession.count({
        where: {
          isActive: true,
          lastActivityAt: { gte: cutoff },
        },
      });

      return activeUsers;
    } catch (error) {
      console.error('Error getting active users:', error);
      return 0;
    }
  }

  /**
   * Get conversion funnel data
   */
  static async getConversionFunnel(steps: string[], days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const funnelData = await Promise.all(
        steps.map(async (step) => {
          const count = await prisma.analyticsEvent.count({
            where: {
              eventName: step,
              timestamp: { gte: startDate },
            },
          });

          const uniqueUsers = await prisma.analyticsEvent.groupBy({
            by: ['userId'],
            where: {
              eventName: step,
              timestamp: { gte: startDate },
              userId: { not: null },
            },
          });

          return {
            step,
            totalEvents: count,
            uniqueUsers: uniqueUsers.length,
          };
        })
      );

      return funnelData;
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      return [];
    }
  }

  /**
   * Private helper methods
   */
  private static async updateSessionActivity(sessionId: string) {
    try {
      await prisma.userSession.update({
        where: { sessionId },
        data: {
          lastActivityAt: new Date(),
          events: { increment: 1 },
        },
      });
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  private static async updateSessionPageViews(sessionId: string) {
    try {
      await prisma.userSession.update({
        where: { sessionId },
        data: {
          pageViews: { increment: 1 },
        },
      });
    } catch (error) {
      console.error('Error updating session page views:', error);
    }
  }

  /**
   * Utility functions for device detection
   */
  static parseUserAgent(userAgent: string) {
    const deviceType = /Mobi|Android/i.test(userAgent) ? 'mobile' : 
                      /Tablet|iPad/i.test(userAgent) ? 'tablet' : 'desktop';
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return { deviceType, browser, os };
  }

  /**
   * Extract UTM parameters from URL
   */
  static extractUtmParams(url: string) {
    const urlObj = new URL(url);
    return {
      utmSource: urlObj.searchParams.get('utm_source') || undefined,
      utmMedium: urlObj.searchParams.get('utm_medium') || undefined,
      utmCampaign: urlObj.searchParams.get('utm_campaign') || undefined,
      utmTerm: urlObj.searchParams.get('utm_term') || undefined,
      utmContent: urlObj.searchParams.get('utm_content') || undefined,
    };
  }
}