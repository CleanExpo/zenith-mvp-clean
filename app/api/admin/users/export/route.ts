import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // Demo mode check
    if (!isStripeConfigured()) {
      const demoCSV = `Email,Name,Role,Status,Created,Last Login,Plan,Revenue
john.doe@company.com,John Doe,premium,active,2023-11-15,2023-12-01,pro,$174.00
sarah.wilson@startup.io,Sarah Wilson,user,active,2023-11-28,2023-12-01,enterprise,$297.00
mike.chen@techcorp.com,Mike Chen,user,inactive,2023-10-05,2023-11-20,free,$0.00`

      return new Response(demoCSV, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Get all users with their data
    const users = await prisma.user.findMany({
      include: {
        // Add subscription relation when available
        // subscription: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Generate CSV content
    const csvHeaders = [
      'Email',
      'Name',
      'Role',
      'Status',
      'Created',
      'Last Login',
      'Plan',
      'Revenue'
    ]

    const csvRows = users.map(user => [
      user.email,
      user.name || '',
      user.email === 'zenithfresh25@gmail.com' ? 'admin' : 'user',
      'active', // Add status field when available
      user.createdAt.toISOString().split('T')[0],
      '', // lastLogin field not available
      'free', // Add subscription plan when available
      '$0.00' // Add revenue calculation when available
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}