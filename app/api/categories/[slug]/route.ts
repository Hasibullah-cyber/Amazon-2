// app/api/categories/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // ✅ 1. Get the category by slug
    const categoryResult = await pool.query(
      `SELECT id, name, slug FROM categories WHERE slug = $1 LIMIT 1`,
      [slug]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const category = categoryResult.rows[0]

    // ✅ 2. Get products that belong to this category
    const productResult = await pool.query(
      `SELECT id, name, description, price, image, stock, reviews, rating
       FROM products
       WHERE category = $1`,
      [category.id]
    )

    
    // ✅ 3. Return both category and its products
    return NextResponse.json({
      category,
      products: productResult.rows,
    })
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}
