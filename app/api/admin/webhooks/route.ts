export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface WebhookEvent {
  id: string
  type: string
  status: 'pending' | 'processed' | 'failed'
  payload: any
  error?: string
  createdAt: string
  processedAt?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' }
    })

    if (!user || user.email !== 'zenithfresh25@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const eventType = searchParams.get('type')

    // Demo data for webhook events
    const demoEvents: WebhookEvent[] = [
      {
        id: 'evt_1234567890',
        type: 'customer.subscription.created',
        status: 'processed',
        payload: {
          id: 'sub_1234567890',
          customer: 'cus_1234567890',
          status: 'active',
          plan: 'pro'
        },
        createdAt: '2023-12-01T14:22:00Z',
        processedAt: '2023-12-01T14:22:05Z'
      },
      {
        id: 'evt_0987654321',
        type: 'invoice.payment_succeeded',
        status: 'processed',
        payload: {
          id: 'in_0987654321',
          customer: 'cus_1234567890',
          amount_paid: 2900,
          status: 'paid'
        },
        createdAt: '2023-12-01T13:15:00Z',
        processedAt: '2023-12-01T13:15:02Z'
      },
      {
        id: 'evt_5555555555',
        type: 'customer.subscription.updated',
        status: 'failed',
        payload: {
          id: 'sub_5555555555',
          customer: 'cus_5555555555',
          status: 'active'
        },
        error: 'User not found for customer',
        createdAt: '2023-12-01T12:30:00Z'
      },
      {
        id: 'evt_9999999999',
        type: 'invoice.payment_failed',
        status: 'pending',
        payload: {
          id: 'in_9999999999',
          customer: 'cus_9999999999',
          amount_due: 2900,
          attempt_count: 1
        },
        createdAt: '2023-12-01T11:45:00Z'
      }
    ]

    // Filter events based on query parameters
    let filteredEvents = demoEvents

    if (status && status !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === status)
    }

    if (eventType && eventType !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.type === eventType)
    }

    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit)

    // Calculate statistics
    const stats = {
      total: demoEvents.length,
      processed: demoEvents.filter(e => e.status === 'processed').length,
      failed: demoEvents.filter(e => e.status === 'failed').length,
      pending: demoEvents.filter(e => e.status === 'pending').length,
      successRate: (demoEvents.filter(e => e.status === 'processed').length / demoEvents.length * 100).toFixed(1)
    }

    return NextResponse.json({
      events: paginatedEvents,
      stats,
      total: filteredEvents.length
    })

  } catch (error) {
    console.error('Error fetching webhook events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' }
    })

    if (!user || user.email !== 'zenithfresh25@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, eventId } = await request.json()

    if (!action || !eventId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    switch (action) {
      case 'retry':
        // In a real app, you'd retry processing the webhook
        console.log(`Retrying webhook event: ${eventId}`)
        return NextResponse.json({ success: true, message: 'Webhook event retried' })

      case 'mark_processed':
        // Mark event as processed
        console.log(`Marking webhook event as processed: ${eventId}`)
        return NextResponse.json({ success: true, message: 'Webhook event marked as processed' })

      case 'delete':
        // Delete webhook event
        console.log(`Deleting webhook event: ${eventId}`)
        return NextResponse.json({ success: true, message: 'Webhook event deleted' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error managing webhook event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}