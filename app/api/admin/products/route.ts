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

// ✅ GET all products with pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  try {
    const result = await pool.query(`
      SELECT 
        p.*, 
        c.name AS category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id::TEXT = c.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    const products = result.rows.map((row) => ({
      ...row,
      category: {
        id: row.category_id,
        name: row.category_name || 'Uncategorized'
      }
    }))

    return NextResponse.json({ products, page, limit })
  } catch (error) {
    console.error('Database error fetching products:', error)

    const fallbackProducts = [
      {
        id: "1",
        name: "Sample Product",
        description: "This is a sample product",
        price: 99.99,
        category: { id: "sample", name: "electronics" },
        image: "/placeholder.svg",
        stock: 50,
        rating: 4.5,
        reviews: 123,
        created_at: new Date().toISOString()
      }
    ]

    return NextResponse.json({ products: fallbackProducts, page: 1, limit: 1 })
  }
}

// ✅ POST new product with validation, fallback image, and auto category/subcategory creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    validateProduct(body)

    const {
      name,
      description,
      price,
      category,         // category_id
      subcategory = null,
      image = '/placeholder.svg',
      stock = 0,
      rating = 0,
      reviews = 0
    } = body

    // 🔒 Prevent duplicate product names
    const duplicateCheck = await pool.query('SELECT id FROM products WHERE name = $1', [name])
    if (duplicateCheck.rowCount > 0) {
      throw new Error('Product with this name already exists')
    }

    // ✅ Auto-create category if it doesn't exist
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE id = $1',
      [category]
    )
    if (categoryCheck.rowCount === 0) {
      await pool.query(
        'INSERT INTO categories (id, name) VALUES ($1, $2)',
        [category, category]
      )
    }

    // ✅ Auto-create subcategory if it doesn't exist (optional)
    if (subcategory) {
      const subcategoryCheck = await pool.query(
        'SELECT id FROM subcategories WHERE id = $1',
        [subcategory]
      )
      if (subcategoryCheck.rowCount === 0) {
        await pool.query(
          'INSERT INTO subcategories (id, name, category_id) VALUES ($1, $2, $3)',
          [subcategory, subcategory, category]
        )
      }
    }

    const result = await pool.query(
      `
      INSERT INTO products (
        name, description, price, category_id, subcategory,
        image, stock, rating, reviews, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
      `,
      [name, description, price, category, subcategory, image, stock, rating, reviews]
    )

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 400 })
  }
}

// ✅ PATCH for partial updates
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) throw new Error('Missing product ID')

    const fields = Object.keys(updates)
    const values = Object.values(updates)

    if (fields.length === 0) throw new Error('No fields to update')

    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ')
    const result = await pool.query(
      `UPDATE products SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('Error patching product:', error)
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 400 })
  }
}
