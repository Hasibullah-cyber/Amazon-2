
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    const client = await pool.connect()

    try {
      if (email) {
        // Check for specific user by email
        const result = await client.query(
          'SELECT id, email, name, created_at as "createdAt" FROM users WHERE email = $1',
          [email]
        )
        
        if (result.rows.length > 0) {
          return NextResponse.json({ user: result.rows[0] })
        } else {
          return NextResponse.json({ user: null })
        }
      } else {
        // Get all users
        const result = await client.query(`
          SELECT 
            id, email, name, created_at as "createdAt"
          FROM users 
          ORDER BY created_at DESC
        `)

        const users = result.rows
        console.log('Fetched users from database:', users.length)
        return NextResponse.json(users)
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { id, email, name, createdAt } = await request.json()

    const client = await pool.connect()

    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }

      // Insert new user
      const result = await client.query(
        `INSERT INTO users (id, email, name, created_at) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, name, created_at as "createdAt"`,
        [id, email, name, createdAt]
      )

      console.log('User saved to database:', result.rows[0])
      return NextResponse.json({ success: true, user: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error saving user to database:', error)
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
  }
}
