export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      twoFactorEnabled: false // TODO: Implement 2FA when ready
    })

  } catch (error) {
    console.error('Error fetching user account:', error)
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

    const { name, email, currentPassword, newPassword } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    // Update name if provided
    if (name !== undefined) {
      updateData.name = name
    }

    // Update email if provided and different
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
      
      updateData.email = email
      updateData.emailVerified = null // Reset verification when email changes
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
      }

      // Verify current password (if user has a password)
      if (user.password) {
        const isValidPassword = await bcrypt.compare(currentPassword, user.password)
        if (!isValidPassword) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedPassword
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true
      }
    })

    return NextResponse.json({
      ...updatedUser,
      twoFactorEnabled: false
    })

  } catch (error) {
    console.error('Error updating user account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In a real application, you might want to:
    // 1. Cancel any active subscriptions
    // 2. Delete or anonymize user data
    // 3. Send a confirmation email
    // 4. Log the deletion for audit purposes

    // For now, we'll soft delete by updating the email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: `deleted_${Date.now()}_${user.email}`,
        name: null,
        password: null,
        emailVerified: null
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}