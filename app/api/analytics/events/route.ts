import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AnalyticsService } from '@/lib/analytics-service';
import { AnalyticsEventType } from '@prisma/client';
import { z } from 'zod';

const queryEventsSchema = z.object({
  eventType: z.nativeEnum(AnalyticsEventType).optional(),
  eventName: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  page: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      eventType: searchParams.get('eventType'),
      eventName: searchParams.get('eventName'),
      userId: searchParams.get('userId'),
      sessionId: searchParams.get('sessionId'),
      page: searchParams.get('page'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validation = queryEventsSchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      eventType,
      eventName,
      userId,
      sessionId,
      page,
      startDate,
      endDate,
      limit,
      offset,
    } = validation.data;

    // Build where clause
    const where: any = {};

    if (eventType) where.eventType = eventType;
    if (eventName) where.eventName = eventName;
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;
    if (page) where.page = page;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [events, totalCount] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          session: {
            select: {
              sessionId: true,
              deviceType: true,
              browser: true,
            },
          },
        },
      }),
      prisma.analyticsEvent.count({ where }),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + events.length < totalCount,
      },
    });
  } catch (error) {
    console.error('Error in events query endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Analytics aggregation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    switch (type) {
      case 'feature_adoption':
        const featureAdoption = await AnalyticsService.getFeatureAdoption(params.days || 30);
        return NextResponse.json({ data: featureAdoption });

      case 'active_users':
        const activeUsers = await AnalyticsService.getActiveUsers(params.minutes || 5);
        return NextResponse.json({ data: activeUsers });

      case 'conversion_funnel':
        if (!params.steps || !Array.isArray(params.steps)) {
          return NextResponse.json(
            { error: 'Steps array is required for conversion funnel' },
            { status: 400 }
          );
        }
        const funnelData = await AnalyticsService.getConversionFunnel(
          params.steps,
          params.days || 30
        );
        return NextResponse.json({ data: funnelData });

      case 'event_trends':
        const trends = await getEventTrends(params);
        return NextResponse.json({ data: trends });

      case 'page_analytics':
        const pageAnalytics = await getPageAnalytics(params);
        return NextResponse.json({ data: pageAnalytics });

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in analytics aggregation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getEventTrends(params: any) {
  const days = params.days || 7;
  const eventType = params.eventType;
  const eventName = params.eventName;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const where: any = {
    timestamp: { gte: startDate },
  };

  if (eventType) where.eventType = eventType;
  if (eventName) where.eventName = eventName;

  const events = await prisma.analyticsEvent.groupBy({
    by: ['eventName'],
    where,
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  return events.map(event => ({
    eventName: event.eventName,
    count: event._count.id,
  }));
}

async function getPageAnalytics(params: any) {
  const days = params.days || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pageViews = await prisma.pageView.groupBy({
    by: ['page'],
    where: {
      timestamp: { gte: startDate },
    },
    _count: {
      id: true,
    },
    _avg: {
      duration: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  return pageViews.map(page => ({
    page: page.page,
    views: page._count.id,
    avgDuration: Math.round(page._avg.duration || 0),
  }));
}