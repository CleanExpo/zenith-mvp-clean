import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analytics-service';
import { z } from 'zod';

const createSessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
  entryPage: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
});

const endSessionSchema = z.object({
  sessionId: z.string(),
  exitPage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const sessionData = validation.data;
    const userAgent = request.headers.get('user-agent') || '';

    // Parse device information from user agent
    const { deviceType, browser, os } = AnalyticsService.parseUserAgent(userAgent);

    // Get geolocation from IP (you can enhance this with a proper IP geolocation service)
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip');

    const session = await AnalyticsService.createSession({
      ...sessionData,
      deviceType,
      browser,
      os,
      // Add geolocation data here if you have an IP geolocation service
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      sessionId: session.sessionId,
      id: session.id 
    });
  } catch (error) {
    console.error('Error in create session endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = endSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, exitPage } = validation.data;

    const session = await AnalyticsService.endSession(sessionId, exitPage);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or failed to end' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      sessionId: session.sessionId,
      duration: session.duration 
    });
  } catch (error) {
    console.error('Error in end session endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    const sessionAnalytics = await AnalyticsService.getSessionAnalytics(sessionId);

    if (!sessionAnalytics) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sessionAnalytics);
  } catch (error) {
    console.error('Error in get session analytics endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}