export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real app, you'd fetch from user preferences table
    // For now, return default settings
    const defaultSettings = {
      email: {
        enabled: true,
        frequency: 'daily',
        welcomeEmails: true,
        securityAlerts: true,
        productUpdates: false,
        marketingEmails: false,
        weeklyDigest: true
      },
      push: {
        enabled: true,
        websiteAlerts: true,
        teamInvitations: true,
        systemUpdates: false,
        maintenanceNotices: true
      },
      inApp: {
        enabled: true,
        sounds: true,
        desktopNotifications: true,
        taskReminders: true,
        reportReady: true
      },
      sms: {
        enabled: false,
        phoneNumber: '',
        criticalAlertsOnly: true,
        securityAlerts: true
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'America/New_York'
      }
    }

    return NextResponse.json(defaultSettings)

  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await request.json()

    // In a real app, you'd save to user preferences table
    // For now, just return success
    
    return NextResponse.json({ success: true, settings })

  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}