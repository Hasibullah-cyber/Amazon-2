// app/api/categories/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { kv } from '@/lib/kv'

export const dynamic = 'force-dynamic'

// Interfaces
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
  product_count: number
}

// Cache key generator
const getCacheKey = (slug: string) => `category:${slug}`

// GET /api/categories/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const cacheKey = getCacheKey(slug)
  
  try {
    // Check cache first
    const cachedData = kv.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      })
    }

    // Get category by slug
    const categoryResult = await pool.query<Category>(
      `SELECT id, name, slug, description 
       FROM categories 
       WHERE slug = $1`,
      [slug]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const category = categoryResult.rows[0]

    // Get subcategories with product counts
    const subcategoriesResult = await pool.query<Subcategory>(
      `SELECT 
        s.id, 
        s.name, 
        s.slug, 
        s.description, 
        s.category_id,
        COUNT(p.id) AS product_count
      FROM subcategories s
      LEFT JOIN products p ON p.subcategory_id = s.id
      WHERE s.category_id = $1 AND p.is_active = true
      GROUP BY s.id
      ORDER BY s.name`,
      [category.id]
    )

    const responseData = {
      category,
      subcategories: subcategoriesResult.rows,
    }

    // Cache the response
    kv.set(cacheKey, responseData)

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    
    // Fallback to cached data if available
    const cachedData = kv.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'STALE',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      })
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch category',
        details: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// POST /api/categories/[slug] - Create new subcategory
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { name, description } = await request.json()

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Valid name is required (min 2 characters)' },
        { status: 400 }
      )
    }

    // Get category ID
    const categoryResult = await pool.query(
      `SELECT id FROM categories WHERE slug = $1`,
      [slug]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const categoryId = categoryResult.rows[0].id

    // Generate slug from name
    const subcategorySlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50) // Limit slug length

    // Insert new subcategory
    const insertResult = await pool.query(
      `INSERT INTO subcategories (name, slug, description, category_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, slug, description, category_id`,
      [name.trim(), subcategorySlug, description?.trim(), categoryId]
    )

    // Invalidate cache
    kv.delete(getCacheKey(slug))

    return NextResponse.json(insertResult.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating subcategory:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Subcategory with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create subcategory',
        details: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// PATCH /api/categories/[slug] - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { name, description } = await request.json()

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Valid name is required (min 2 characters)' },
        { status: 400 }
      )
    }

    // Generate new slug from name
    const newSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50) // Limit slug length

    // Update category
    const updateResult = await pool.query(
      `UPDATE categories 
       SET name = $1, slug = $2, description = $3
       WHERE slug = $4
       RETURNING id, name, slug, description`,
      [name.trim(), newSlug, description?.trim(), slug]
    )

    if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Invalidate cache for both old and new slugs
    kv.delete(getCacheKey(slug))
    kv.delete(getCacheKey(newSlug))

    return NextResponse.json(updateResult.rows[0])
  } catch (error) {
    console.error('Error updating category:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to update category',
        details: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[slug] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Get category ID
    const categoryResult = await pool.query(
      `SELECT id FROM categories WHERE slug = $1`,
      [slug]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const categoryId = categoryResult.rows[0].id

    // Check for subcategories
    const subcategoriesResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM subcategories WHERE category_id = $1`,
      [categoryId]
    )

    if (subcategoriesResult.rows[0].count > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with subcategories',
          subcategory_count: subcategoriesResult.rows[0].count
        },
        { status: 400 }
      )
    }

    // Delete category
    await pool.query(
      `DELETE FROM categories WHERE id = $1`,
      [categoryId]
    )

    // Invalidate cache
    kv.delete(getCacheKey(slug))

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete category',
        details: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
