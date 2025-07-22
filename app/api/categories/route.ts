import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'  // PostgreSQL connection

export const dynamic = 'force-dynamic'

// ✅ GET: Return all categories with subcategories and product count
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug,
              'description', s.description,
              'productCount', COALESCE(pc.count, 0)
            )
            ORDER BY s.name
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS subcategories
      FROM categories c
      LEFT JOIN subcategories s ON s.category_id = c.id
      LEFT JOIN (
        SELECT subcategory_id, COUNT(*) AS count
        FROM products
        WHERE subcategory_id IS NOT NULL
        GROUP BY subcategory_id
      ) pc ON pc.subcategory_id = s.id
      GROUP BY c.id, c.name, c.slug, c.description
      ORDER BY c.name
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// ✅ POST: Create a new category
export async function POST(request: Request) {
  try {
    const { name, slug, description } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *`,
      [name, slug, description || null]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error adding category:', error)
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 })
  }
}
