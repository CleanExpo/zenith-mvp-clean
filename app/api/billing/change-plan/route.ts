export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PRICING_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, subscriptionId } = body

    // Validate planId
    if (!planId || !PRICING_PLANS[planId as keyof typeof PRICING_PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In a real app, this would:
    // 1. Validate the user session
    // 2. Update the Stripe subscription
    // 3. Update the database
    // 4. Handle prorated billing
    // 5. Send confirmation emails

    // Demo response
    return NextResponse.json({
      success: true,
      message: `Demo: Successfully changed to ${PRICING_PLANS[planId as keyof typeof PRICING_PLANS].name} plan`,
      subscription: {
        id: subscriptionId || 'sub_demo_123',
        planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      }
    })

  } catch (error) {
    console.error('Error changing plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}