export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json()

    if (!type) {
      return NextResponse.json({ error: 'Notification type is required' }, { status: 400 })
    }

    let result = false
    const userEmail = session.user.email || 'test@example.com'
    const userName = session.user.name || 'Test User'

    switch (type) {
      case 'email':
        result = await emailService.sendTestEmail(userEmail)
        break

      case 'push':
        // For demo purposes, simulate push notification
        result = true
        console.log(`📱 Would send push notification to ${userName}`)
        break

      case 'sms':
        // For demo purposes, simulate SMS
        result = true
        console.log(`📱 Would send SMS notification to ${userName}`)
        break

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: `Test ${type} notification sent successfully`,
        demoMode: emailService.getDemoMode()
      })
    } else {
      return NextResponse.json({ 
        error: `Failed to send test ${type} notification`,
        demoMode: emailService.getDemoMode()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}