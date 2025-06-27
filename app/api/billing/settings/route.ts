import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isStripeConfigured()) {
      // Demo data
      return NextResponse.json({
        subscription: {
          id: 'sub_demo123',
          plan: 'pro',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false
        },
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          expMonth: 12,
          expYear: 2025
        },
        notifications: {
          paymentFailed: true,
          subscriptionChanges: true,
          invoiceReminders: false,
          usageAlerts: true
        },
        invoices: [
          {
            id: 'in_demo1',
            amount: 29,
            status: 'paid',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            invoiceUrl: '#'
          }
        ],
        upcomingInvoice: {
          amount: 29,
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
    }

    // Real Stripe integration would go here
    return NextResponse.json({ error: 'Billing not configured' }, { status: 503 })

  } catch (error) {
    console.error('Error fetching billing settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}