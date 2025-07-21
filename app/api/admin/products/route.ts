import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ Validate incoming product data
function validateProduct(data: any) {
  const requiredFields = ['name', 'description', 'price', 'category']
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

// ✅ GET: Paginated list of products
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const offset = (page - 1) * limit

  try {
    const result = await pool.query(
      `
      SELECT 
        p.*, 
        c.name AS category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id::TEXT = c.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    )

    const products = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      image: row.image,
      price: Number(row.price ?? 0),
      stock: Number(row.stock ?? 0),
      rating: row.rating,
      reviews: row.reviews,
      featured: row.featured,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category: {
        id: row.category_id ?? 'uncategorized',
        name: row.category_name ?? 'Uncategorized',
      },
    }))

    return NextResponse.json({ products, page, limit })
  } catch (error) {
    console.error('Database error fetching products:', error)

    return NextResponse.json(
      {
        products: [],
        page: 1,
        limit: 20,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    )
  }
}

// ✅ PATCH: Update an existing product
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json()

    const {
      id,
      name,
      description,
      price,
      stock,
      image,
      category,
      featured,
      is_active,
    } = data

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    validateProduct({ name, description, price, category })

    // Check if the category exists or insert it
    let categoryId = category?.id
    if (!categoryId) {
      const result = await pool.query(
        `INSERT INTO categories (name) VALUES ($1) RETURNING id`,
        [category.name]
      )
      categoryId = result.rows[0].id
    }

    // Update product
    await pool.query(
      `
      UPDATE products SET
        name = $1,
        description = $2,
        price = $3,
        stock = $4,
        image = $5,
        category_id = $6,
        featured = $7,
        is_active = $8,
        updated_at = NOW()
      WHERE id = $9
      `,
      [
        name,
        description,
        price,
        stock,
        image,
        categoryId,
        featured ?? false,
        is_active ?? true,
        id,
      ]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/products] Error updating product:', err)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}
