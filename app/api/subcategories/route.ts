// app/api/subcategories/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// GET /api/subcategories — list all subcategories with parent category
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        s.id AS subcategory_id,
        s.name AS subcategory_name,
        s.slug AS subcategory_slug,
        s.description AS subcategory_description,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.name
    `)

    const subcategories = result.rows.map(row => ({
      id: row.subcategory_id,
      name: row.subcategory_name,
      slug: row.subcategory_slug,
      description: row.subcategory_description,
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      },
    }))

    return NextResponse.json({ subcategories })
  } catch (error) {
    console.error('GET /api/subcategories error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch subcategories',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
