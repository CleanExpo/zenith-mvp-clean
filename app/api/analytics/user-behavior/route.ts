import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const userBehaviorSchema = z.object({
  userId: z.string().optional(),
  days: z.number().min(1).max(365).default(30),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');

    const validation = userBehaviorSchema.safeParse({ userId, days });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    // If no userId provided, try to get from session
    let targetUserId = validation.data.userId;
    if (!targetUserId) {
      const session = await getServerSession();
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'User ID required or user must be authenticated' },
          { status: 401 }
        );
      }
      // You would need to get userId from email here
      // For now, we'll require explicit userId
      return NextResponse.json(
        { error: 'User ID parameter is required' },
        { status: 400 }
      );
    }

    const behaviorData = await AnalyticsService.getUserBehavior(targetUserId, validation.data.days);

    if (!behaviorData) {
      return NextResponse.json(
        { error: 'Failed to retrieve user behavior data' },
        { status: 500 }
      );
    }

    // Calculate additional insights
    const totalEvents = behaviorData.events.length;
    const totalSessions = behaviorData.sessions.length;
    const totalPageViews = behaviorData.pageViews.length;
    const avgSessionDuration = behaviorData.sessions.reduce((acc, session) => {
      return acc + (session.duration || 0);
    }, 0) / (totalSessions || 1);

    // Most used features
    const featureUsageMap = new Map();
    behaviorData.featureUsage.forEach(usage => {
      const count = featureUsageMap.get(usage.featureName) || 0;
      featureUsageMap.set(usage.featureName, count + 1);
    });

    const topFeatures = Array.from(featureUsageMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([feature, count]) => ({ feature, count }));

    // Most visited pages
    const pageViewMap = new Map();
    behaviorData.pageViews.forEach(pageView => {
      const count = pageViewMap.get(pageView.page) || 0;
      pageViewMap.set(pageView.page, count + 1);
    });

    const topPages = Array.from(pageViewMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // Journey progression
    const journeyStages = ['awareness', 'consideration', 'trial', 'purchase', 'retention'];
    const journeyProgress = journeyStages.map(stage => {
      const stageEvents = behaviorData.journeys.filter(j => j.journeyStage === stage);
      return {
        stage,
        count: stageEvents.length,
        lastActivity: stageEvents.length > 0 ? stageEvents[0].timestamp : null,
      };
    });

    return NextResponse.json({
      userId: targetUserId,
      period: validation.data.days,
      summary: {
        totalEvents,
        totalSessions,
        totalPageViews,
        avgSessionDuration: Math.round(avgSessionDuration),
      },
      topFeatures,
      topPages,
      journeyProgress,
      rawData: behaviorData,
    });
  } catch (error) {
    console.error('Error in user behavior endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}