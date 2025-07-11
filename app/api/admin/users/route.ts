import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic' // ⬅️ makes this API route always fresh

export async function GET() {
  try {
    const client = await pool.connect()

    try {
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
        newThisWeek: users.filter(user => {
          const userDate = new Date(user.createdAt)
          return userDate > weekAgo
        }).length,
        newThisMonth: users.filter(user => {
          const userDate = new Date(user.createdAt)
          return userDate > monthAgo
        }).length
      }

      return NextResponse.json({
        users,
        stats: userStats
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error fetching users:', error)

    return NextResponse.json({ 
      users: [],
      stats: {
        totalUsers: 0,
        newThisWeek: 0,
        newThisMonth: 0
      },
      error: 'Database connection failed'
    }, { status: 200 })
  }
}
