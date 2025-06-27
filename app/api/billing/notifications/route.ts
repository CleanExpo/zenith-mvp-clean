export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStripeConfigured } from '@/lib/stripe'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await request.json()

    if (!isStripeConfigured()) {
      // Demo mode - just return success
      return NextResponse.json({ success: true, notifications })
    }

    // Real implementation would save to database/user preferences
    return NextResponse.json({ success: true, notifications })

  } catch (error) {
    console.error('Error updating billing notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}