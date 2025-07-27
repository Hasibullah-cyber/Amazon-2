// app/api/categories/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { createClient } from '@vercel/kv'
import { kv } from '@/lib/kv'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate data every hour

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
function getCacheKey(slug: string) {
  return `category:${slug}`
}

// GET /api/categories/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  const cacheKey = getCacheKey(slug)
  
  try {
    // Check cache first
    const cachedData = await kv.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Get category by slug
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
      LEFT JOIN products p ON p.subcategory_id = s.id AND p.is_active = true
      WHERE s.category_id = $1
      GROUP BY s.id
      ORDER BY s.name`,
      [category.id]
    )

    const responseData = {
      category,
      subcategories: subcategoriesResult.rows,
    }

    // Cache the response
    await kv.set(cacheKey, responseData, { ex: 3600 }) // Cache for 1 hour

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    
    // Try to return cached data if available
    try {
      const cachedData = await kv.get(cacheKey)
      if (cachedData) {
        return NextResponse.json(cachedData)
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError)
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch category',
        details: error instanceof Error ? error.message : 'Unknown error',
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

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get category ID
    const categoryResult = await pool.query(
      `SELECT id FROM categories WHERE slug = $1 LIMIT 1`,
      [slug]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const categoryId = categoryResult.rows[0].id

    // Create slug from name
    const subcategorySlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Insert new subcategory
    const insertResult = await pool.query(
      `INSERT INTO subcategories (name, slug, description, category_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, slug, description, category_id`,
      [name, subcategorySlug, description, categoryId]
    )

    // Invalidate cache
    await kv.del(getCacheKey(slug))

    return NextResponse.json(insertResult.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return NextResponse.json(
      {
        error: 'Failed to create subcategory',
        details: error instanceof Error ? error.message : 'Unknown error',
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

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create new slug from name
    const newSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Update category
    const updateResult = await pool.query(
      `UPDATE categories 
       SET name = $1, slug = $2, description = $3
       WHERE slug = $4
       RETURNING id, name, slug, description`,
      [name, newSlug, description, slug]
    )

    if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Invalidate cache for both old and new slugs
    await kv.del(getCacheKey(slug))
    await kv.del(getCacheKey(newSlug))

    return NextResponse.json(updateResult.rows[0])
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      {
        error: 'Failed to update category',
        details: error instanceof Error ? error.message : 'Unknown error',
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

    // First, get category ID
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

    // Check if category has subcategories
    const subcategoriesResult = await pool.query(
      `SELECT COUNT(*) FROM subcategories WHERE category_id = $1`,
      [categoryId]
    )

    if (subcategoriesResult.rows[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      )
    }

    // Delete category
    const deleteResult = await pool.query(
      `DELETE FROM categories WHERE slug = $1 RETURNING id`,
      [slug]
    )

    if (deleteResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Invalidate cache
    await kv.del(getCacheKey(slug))

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
