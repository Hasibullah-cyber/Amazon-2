
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      // Test database connection
      const result = await client.query('SELECT NOW() as current_time')
      
      // Check if orders table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'orders'
        );
      `)
      
      return NextResponse.json({
        success: true,
        database: 'connected',
        currentTime: result.rows[0].current_time,
        ordersTableExists: tableCheck.rows[0].exists,
        message: 'Database is healthy'
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json({
      success: false,
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database health check failed'
    }, { status: 500 })
  }
}
