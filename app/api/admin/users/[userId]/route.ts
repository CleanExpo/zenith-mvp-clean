export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isStripeConfigured } from '@/lib/stripe'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { action } = await request.json()
    const { userId } = params

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    // Demo mode check
    if (!isStripeConfigured()) {
      return NextResponse.json({ 
        success: true, 
        message: `Demo: Would ${action} user ${userId}` 
      })
    }

    // Validate user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Handle user actions
    switch (action) {
      case 'suspend':
        // Update user status to suspended
        // Note: You'll need to add a status field to your User model
        await prisma.user.update({
          where: { id: userId },
          data: { 
            // status: 'suspended'
            // For now, we'll use a custom field or update when schema is ready
          }
        })
        break

      case 'activate':
        // Update user status to active
        await prisma.user.update({
          where: { id: userId },
          data: {
            // status: 'active'
            // For now, we'll use a custom field or update when schema is ready
          }
        })
        break

      case 'delete':
        // Soft delete user by updating a deletedAt field
        await prisma.user.update({
          where: { id: userId },
          data: {
            // deletedAt: new Date()
            // For now, we'll use email update to mark as deleted
            email: `deleted_${Date.now()}_${targetUser.email}`
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

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params

    // Demo mode check
    if (!isStripeConfigured()) {
      return NextResponse.json({
        id: userId,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'user',
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
      })
    }

    // Get user details
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        // Add subscription relation when available
        // subscription: true,
      }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Transform user data
    const userData = {
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.email === 'zenithfresh25@gmail.com' ? 'admin' : 'user',
      status: 'active', // Add status field when available
      createdAt: targetUser.createdAt.toISOString(),
      lastLogin: null, // lastLogin field not available in current schema
      subscription: null, // Add subscription data when available
      usage: {
        projects: 0, // Calculate from project count
        apiCalls: 0, // Calculate from API usage
        storage: 0   // Calculate from storage usage
      },
      totalRevenue: 0 // Calculate from billing data
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}