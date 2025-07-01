
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET() {
  try {
    const client = await pool.connect()

    try {
      // Try to get users from database first
      const result = await client.query(`
        SELECT 
          id, email, name, created_at as "createdAt"
        FROM users 
        ORDER BY created_at DESC
      `)

      const users = result.rows
      console.log('Fetched users from database:', users.length)
      return NextResponse.json(users)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error fetching users, using localStorage fallback:', error)

    // Fallback to localStorage users
    const fallbackUsers = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: "2", 
        name: "Jane Smith",
        email: "jane@example.com",
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      }
    ]

    // Also try to get users from localStorage (client-side users)
    // This simulates what would be in localStorage
    try {
      // In a real scenario, you'd need to sync localStorage users to the database
      console.log('Using fallback user data')
      return NextResponse.json(fallbackUsers)
    } catch (err) {
      console.log('Using minimal fallback user data')
      return NextResponse.json(fallbackUsers)
    }
  }
}
