import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { AnalyticsEventType } from '@prisma/client';
import { z } from 'zod';

const trackEventSchema = z.object({
  eventType: z.nativeEnum(AnalyticsEventType),
  eventName: z.string(),
  properties: z.record(z.any()).optional(),
  page: z.string().optional(),
  referrer: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = trackEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, userId, ...eventData } = validation.data;

    // Extract additional metadata from request
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      undefined;

    const event = await AnalyticsService.trackEvent(
      {
        ...eventData,
        userAgent,
        ipAddress,
      },
      sessionId,
      userId
    );

    if (!event) {
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('Error in analytics track endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Batch tracking endpoint
const batchTrackSchema = z.object({
  events: z.array(trackEventSchema),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = batchTrackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { events } = validation.data;
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      undefined;

    const results = await Promise.allSettled(
      events.map(({ sessionId, userId, ...eventData }) =>
        AnalyticsService.trackEvent(
          {
            ...eventData,
            userAgent,
            ipAddress,
          },
          sessionId,
          userId
        )
      )
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error('Error in analytics batch track endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}