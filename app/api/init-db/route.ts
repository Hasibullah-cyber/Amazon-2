
import { NextResponse } from 'next/server'
import { initializeTables } from '@/lib/database'
import { initializeDefaultAdmin } from '@/lib/admin-auth'

export async function POST() {
  try {
    console.log('Initializing database...')
    
    // Initialize database tables
    await initializeTables()
    
    // Initialize default admin user
    await initializeDefaultAdmin()
    
    console.log('Database initialization completed successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    })
  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Database initialization endpoint. Use POST to initialize.' 
  })
}
