export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isStripeConfigured } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (you'll need to implement this check)
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
    const plan = searchParams.get('plan')
    const search = searchParams.get('search')

    // Demo mode check
    if (!isStripeConfigured()) {
      return NextResponse.json({
        users: [
          {
            id: 'user1',
            email: 'john.doe@company.com',
            name: 'John Doe',
            role: 'premium',
            status: 'active',
            createdAt: '2023-11-15T10:30:00Z',
            lastLogin: '2023-12-01T14:22:00Z',
            subscription: {
              plan: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-01-15T00:00:00Z'
            },
            usage: {
              projects: 12,
              apiCalls: 25400,
              storage: 4.2
            },
            totalRevenue: 174
          }
        ],
        stats: {
          total: 1247,
          active: 1156,
          premium: 189,
          churnRate: 2.3,
          averageRevenue: 47.50,
          newThisMonth: 89,
          growthRate: 12.4
        },
        total: 1247
      })
    }

    // Build where clause for filtering
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get users with subscriptions and usage data
    const users = await prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        // Add subscription relation when you have it
        // subscription: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get total count
    const total = await prisma.user.count({ where })

    // Calculate stats
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { 
        createdAt: { 
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Count recently created users as proxy for active
        }
      }
    })

    const stats = {
      total: totalUsers,
      active: activeUsers,
      premium: 0, // Calculate from subscription data
      churnRate: 0, // Calculate from subscription cancellations
      averageRevenue: 0, // Calculate from billing data
      newThisMonth: await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      growthRate: 0 // Calculate month-over-month growth
    }

    // Transform users data to match frontend interface
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.email === 'zenithfresh25@gmail.com' ? 'admin' : 'user',
      status: 'active', // You'll need to add status field to user model
      createdAt: user.createdAt.toISOString(),
      lastLogin: null, // lastLogin field not available
      subscription: null, // Add subscription data when available
      usage: {
        projects: 0, // Calculate from project count
        apiCalls: 0, // Calculate from API usage
        storage: 0   // Calculate from storage usage
      },
      totalRevenue: 0 // Calculate from billing data
    }))

    return NextResponse.json({
      users: transformedUsers,
      stats,
      total
    })

  } catch (error) {
    console.error('Error fetching users:', error)
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' }
    })

    if (!user || user.email !== 'zenithfresh25@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Demo mode check
    if (!isStripeConfigured()) {
      return NextResponse.json({ 
        success: true, 
        message: `Demo: Would ${action} user ${userId}` 
      })
    }

    // Handle user actions
    switch (action) {
      case 'suspend':
        // Update user status to suspended
        await prisma.user.update({
          where: { id: userId },
          data: { 
            // status: 'suspended' // Add status field to user model
          }
        })
        break

      case 'activate':
        // Update user status to active
        await prisma.user.update({
          where: { id: userId },
          data: {
            // status: 'active' // Add status field to user model
          }
        })
        break

      case 'delete':
        // Soft delete user
        await prisma.user.update({
          where: { id: userId },
          data: {
            // deletedAt: new Date() // Add deletedAt field for soft delete
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}