// app/api/subcategories/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

interface Subcategory {
  id: number
  name: string
  slug: string
  description: string | null
  category_id: number
}

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
}

// GET /api/subcategories/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const result = await pool.query<{
      subcategory_id: number
      subcategory_name: string
      subcategory_slug: string
      subcategory_description: string | null
      category_id: number
      category_name: string
      category_slug: string
      category_description: string | null
    }>(
      `
      SELECT 
        s.id AS subcategory_id,
        s.name AS subcategory_name,
        s.slug AS subcategory_slug,
        s.description AS subcategory_description,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.description AS category_description
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.slug = $1
      LIMIT 1
      `,
      [slug]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }

    const row = result.rows[0]

    return NextResponse.json({
      subcategory: {
        id: row.subcategory_id,
        name: row.subcategory_name,
        slug: row.subcategory_slug,
        description: row.subcategory_description,
      },
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        description: row.category_description,
      },
    })
  } catch (error) {
    console.error('Error fetching subcategory by slug:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch subcategory',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
  }
