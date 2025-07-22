import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ GET: Return all categories with subcategories and product count
export async function GET() {
  try {
    const { rows } = await pool.query<{
      id: number
      name: string
      slug: string
      description: string | null
      subcategories: Array<{
        id: number
        name: string
        slug: string
        description: string | null
        productCount: number
      }>
    }>(`
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

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// ✅ POST: Create a new category
export async function POST(request: Request) {
  try {
    const { name, slug, description } = await request.json()

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: 'Name and slug are required and cannot be empty' },
        { status: 400 }
      )
    }

    const { rows } = await pool.query<{
      id: number
      name: string
      slug: string
      description: string | null
    }>(
      `INSERT INTO categories (name, slug, description) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, slug, description`,
      [name.trim(), slug.trim(), description?.trim() || null]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Error adding category:', error)
    
    // Handle duplicate slug error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to add category',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
