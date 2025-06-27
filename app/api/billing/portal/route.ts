export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, isStripeConfigured } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json({ 
        error: 'Demo mode - billing portal not available',
        demoMode: true 
      }, { status: 503 })
    }

    // In a real app, you'd have the customer ID stored
    // For now, return an error since we don't have Stripe customer setup
    return NextResponse.json({ 
      error: 'Customer not found - billing portal not available in demo',
      demoMode: true 
    }, { status: 404 })

    // Real implementation would be:
    // const portalSession = await stripe.billingPortal.sessions.create({
    //   customer: customerStripeId,
    //   return_url: `${process.env.NEXTAUTH_URL}/settings?tab=billing`
    // })
    // 
    // return NextResponse.json({ url: portalSession.url })

  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}