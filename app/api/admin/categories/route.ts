import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Helper to create slugs
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

// ✅ GET — Fetch categories with subcategories (schema-aligned)
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
              'category_id', s.category_id
            ) ORDER BY s.name
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS subcategories
      FROM categories c
      LEFT JOIN subcategories s ON s.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `)

    const cleaned = result.rows.map(row => ({
      id: row.id,
      name: String(row.name ?? ''),
      slug: String(row.slug ?? ''),
      description: row.description ? String(row.description) : '',
      subcategories: Array.isArray(row.subcategories)
        ? row.subcategories.map((sub: any) => ({
            id: sub.id,
            name: String(sub.name ?? ''),
            slug: String(sub.slug ?? ''),
            description: sub.description ? String(sub.description) : '',
            category_id: sub.category_id
          }))
        : []
    }))

    return NextResponse.json(cleaned)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// ✅ POST — Add a new category (slug auto-generated)
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
    }

    const slug = slugify(name)

    const result = await pool.query(
      `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING *`,
      [name, slug, description]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error adding category:', error)
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 })
  }
}
