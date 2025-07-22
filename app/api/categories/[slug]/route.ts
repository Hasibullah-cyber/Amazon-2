// app/api/categories/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

interface Category {
  id: number
  name: string
  slug: string
}

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  image: string | null
  stock: number
  reviews: number
  rating: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    // 1. Get the category by slug
    const categoryResult = await pool.query<Category>(
      `SELECT id, name, slug FROM categories WHERE slug = $1 LIMIT 1`,
      [slug]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const category = categoryResult.rows[0]

    // 2. Get products that belong to this category with pagination support
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 100
    const page = Number(searchParams.get('page')) || 1
    const offset = (page - 1) * limit

    const productResult = await pool.query<Product>(
      `SELECT 
        id, 
        name, 
        description, 
        price, 
        image, 
        stock, 
        reviews, 
        rating
       FROM products
       WHERE category_id = $1
       ORDER BY name ASC
       LIMIT $2 OFFSET $3`,
      [category.id, limit, offset]
    )

    // 3. Get total count for pagination metadata
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products WHERE category_id = $1`,
      [category.id]
    )
    const total = Number(countResult.rows[0].count)

    return NextResponse.json({
      category,
      products: productResult.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch category',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
