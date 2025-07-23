// app/api/categories/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
}

interface Subcategory {
  id: number
  name: string
  slug: string
  description: string | null
  category_id: number
}

// GET /api/categories/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // 1. Get category by slug
    const categoryResult = await pool.query<Category>(
      `SELECT id, name, slug, description FROM categories WHERE slug = $1 LIMIT 1`,
      [slug]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const category = categoryResult.rows[0]

    // 2. Get subcategories under this category
    const subcategoriesResult = await pool.query<Subcategory>(
      `SELECT id, name, slug, description, category_id FROM subcategories WHERE category_id = $1 ORDER BY name`,
      [category.id]
    )

    return NextResponse.json({
      category,
      subcategories: subcategoriesResult.rows,
    })
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch category',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
