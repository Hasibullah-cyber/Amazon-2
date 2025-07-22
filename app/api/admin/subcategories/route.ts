import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// GET all subcategories (optional, can be used if needed)
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, name, description, category_id
      FROM subcategories
      ORDER BY name
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 })
  }
}

// POST add new subcategory
export async function POST(request: NextRequest) {
  try {
    const { name, description, category_id } = await request.json()

    if (!name || !description || !category_id) {
      return NextResponse.json({ error: 'Name, description, and category_id are required' }, { status: 400 })
    }

    // Insert subcategory
    const insertResult = await pool.query(
      `INSERT INTO subcategories (name, description, category_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, description, category_id]
    )

    return NextResponse.json(insertResult.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error adding subcategory:', error)
    return NextResponse.json({ error: 'Failed to add subcategory' }, { status: 500 })
  }
}
