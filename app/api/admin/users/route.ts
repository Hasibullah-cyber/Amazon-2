
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET() {
  try {
    const client = await pool.connect()

    try {
      // Get users from database
      const result = await client.query(`
        SELECT 
          id, email, name, created_at as "createdAt"
        FROM users 
        ORDER BY created_at DESC
      `)

      const users = result.rows
      console.log('Admin: Fetched users from database:', users.length)
      
      // Add user statistics for admin dashboard
      const userStats = {
        totalUsers: users.length,
        newThisWeek: users.filter(user => {
          const userDate = new Date(user.createdAt)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return userDate > weekAgo
        }).length,
        newThisMonth: users.filter(user => {
          const userDate = new Date(user.createdAt)
          const monthAgo = new Date()
          monthAgo.setDate(monthAgo.getDate() - 30)
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
      stats: { totalUsers: 0, newThisWeek: 0, newThisMonth: 0 },
      error: 'Database connection failed' 
    }, { status: 500 })
  }
}
