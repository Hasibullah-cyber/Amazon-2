import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

function validateProduct(data: any) {
  const requiredFields = ['name', 'description', 'price', 'category']
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`)
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const offset = (page - 1) * limit

  try {
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id::TEXT = c.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

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
    return NextResponse.json({ products: [], page: 1, limit: 20 }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    validateProduct(data)

    const {
      name,
      description,
      price,
      stock = 0,
      image = '/placeholder.svg',
      category,
      rating = 4.0,
      reviews = 0
    } = data

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, image, category_id, rating, reviews)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, price, stock, image, category, rating, reviews]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('POST /products error:', error)
    return NextResponse.json({ error: 'Invalid product data' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, updates } = await req.json()

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing product id or updates' }, { status: 400 })
    }

    const fields = []
    const values = []
    let paramIndex = 1

    if (updates.name) {
      fields.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.description) {
      fields.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramIndex++}`)
      values.push(updates.price)
    }
    if (updates.stock !== undefined) {
      fields.push(`stock = $${paramIndex++}`)
      values.push(updates.stock)
    }
    if (updates.image) {
      fields.push(`image = $${paramIndex++}`)
      values.push(updates.image)
    }
    if (updates.category?.id) {
      fields.push(`category_id = $${paramIndex++}`)
      values.push(updates.category.id)
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    values.push(id)
    const query = `UPDATE products SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`

    await pool.query(query, values)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /admin/products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
