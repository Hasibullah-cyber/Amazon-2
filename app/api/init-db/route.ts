import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database'

export async function POST() {
  try {
    await initializeDatabase()
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize database' 
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}