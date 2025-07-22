import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

// GET — fetch all products from PostgreSQL
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, name, description, price, image, reviews, stock, rating, category_id
      FROM products
    `)

    const products = result.rows.map((product) => ({
      ...product,
      category: product.category_id, // optional: convert category_id if needed
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST — add a new product
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      name, description, price, image, reviews = 0, stock = 0, rating = 0, category,
    } = data

    const result = await pool.query(
      `
      INSERT INTO products (name, description, price, image, reviews, stock, rating, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [name, description, price, image, reviews, stock, rating, category]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}
