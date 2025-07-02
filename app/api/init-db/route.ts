import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database'

export async function POST() {
  try {
    console.log('Starting database initialization...')
    console.log('DATABASE_URL configured:', process.env.DATABASE_URL ? 'Yes' : 'No')

    const success = await initializeDatabase()

    if (success) {
      console.log('Database tables initialized successfully')
      return NextResponse.json({ 
        success: true, 
        message: 'Database tables initialized successfully' 
      })
    } else {
      console.log('Database initialization failed - check DATABASE_URL configuration')
      return NextResponse.json({ 
        success: false, 
        message: 'Database initialization failed - check DATABASE_URL configuration' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}