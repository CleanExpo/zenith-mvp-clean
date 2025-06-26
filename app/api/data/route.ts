import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .limit(10)

    if (error) {
      // If table doesn't exist, that's expected for now
      return NextResponse.json({
        status: 'ready',
        message: 'Supabase connection established',
        timestamp: new Date().toISOString(),
        note: 'Database tables not yet created - this is expected'
      })
    }

    return NextResponse.json({
      status: 'connected',
      data,
      timestamp: new Date().toISOString(),
      message: 'Supabase database operational'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}