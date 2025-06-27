export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real app, you'd fetch from api_keys table
    // For now, return demo data
    const demoData = {
      keys: [
        {
          id: 'key_1',
          name: 'Production API',
          key: 'zth_sk_1234567890abcdef',
          permissions: ['read', 'write'],
          lastUsed: '2023-12-01T14:22:00Z',
          createdAt: '2023-11-15T10:30:00Z',
          expiresAt: null,
          usage: {
            total: 15420,
            today: 142,
            limit: 10000
          }
        }
      ],
      webhookUrl: 'https://api.yourapp.com/webhooks/zenith',
      webhookSecret: 'whsec_1234567890abcdef',
      rateLimits: {
        perMinute: 60,
        perHour: 1000,
        perDay: 10000
      },
      allowedOrigins: ['https://yourapp.com', 'https://staging.yourapp.com']
    }

    return NextResponse.json(demoData)

  } catch (error) {
    console.error('Error fetching API keys:', error)
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

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 })
    }

    // Generate a new API key
    const apiKey = `zth_sk_${randomBytes(16).toString('hex')}`

    // In a real app, you'd save to database
    const newKey = {
      id: `key_${Date.now()}`,
      name: name.trim(),
      key: apiKey,
      permissions: ['read'],
      lastUsed: null,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      usage: {
        total: 0,
        today: 0,
        limit: 1000
      }
    }

    return NextResponse.json(newKey)

  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}