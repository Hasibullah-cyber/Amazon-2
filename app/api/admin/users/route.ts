import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  let client

  try {
    client = await pool.connect()

    const result = await client.query(`
      SELECT 
        id, email, name, created_at as "createdAt"
      FROM users 
      ORDER BY created_at DESC
    `)

    const users = result.rows || []

    const now = new Date()
    const weekAgo = new Date(now)
    const monthAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    monthAgo.setDate(now.getDate() - 30)

    const userStats = {
      totalUsers: users.length,
      newThisWeek: users.filter(user => new Date(user.createdAt) > weekAgo).length,
      newThisMonth: users.filter(user => new Date(user.createdAt) > monthAgo).length
    }

    return NextResponse.json({
      users,
      stats: userStats
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('❌ Error fetching users:', error?.message)
    console.error('📦 Stack Trace:', error?.stack)

    return NextResponse.json({
      users: [],
      stats: {
        totalUsers: 0,
        newThisWeek: 0,
        newThisMonth: 0
      },
      error: error?.message || 'Unknown error occurred'
    }, { status: 500 }) // Return 500 for actual backend failure
  } finally {
    if (client) {
      client.release()
    }
  }
}
