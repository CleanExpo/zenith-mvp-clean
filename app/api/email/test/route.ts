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

    const { type, email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    let result = false
    const testEmail = email || session.user.email

    switch (type) {
      case 'test':
        result = await emailService.sendTestEmail(testEmail)
        break

      case 'welcome':
        result = await emailService.sendWelcomeEmail({
          name: session.user.name || 'Test User',
          email: testEmail,
          loginUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth`
        })
        break

      case 'payment':
        result = await emailService.sendPaymentConfirmationEmail({
          name: session.user.name || 'Test User',
          amount: 29.00,
          plan: 'Pro Plan',
          invoiceUrl: '#',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        })
        break

      case 'subscription':
        result = await emailService.sendSubscriptionUpdateEmail({
          name: session.user.name || 'Test User',
          oldPlan: 'Free',
          newPlan: 'Pro',
          effectiveDate: new Date().toLocaleDateString(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          amount: 29.00
        })
        break

      case 'reset':
        result = await emailService.sendPasswordResetEmail(
          testEmail,
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset?token=demo_token`,
          session.user.name || 'Test User'
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: emailService.getDemoMode() 
          ? `Demo: ${type} email would be sent to ${testEmail}` 
          : `${type} email sent successfully to ${testEmail}`,
        demoMode: emailService.getDemoMode()
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to send email',
        demoMode: emailService.getDemoMode()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      configured: emailService.isConfigured(),
      demoMode: emailService.getDemoMode(),
      fromEmail: process.env.FROM_EMAIL || 'noreply@zenith.com',
      availableTypes: ['test', 'welcome', 'payment', 'subscription', 'reset']
    })

  } catch (error) {
    console.error('Email status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}