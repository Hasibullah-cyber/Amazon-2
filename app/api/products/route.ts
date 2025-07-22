import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

// GET — fetch all products from PostgreSQL
export async function GET() {
  try {
    const result = await pool.query<{
      id: number
      name: string
      description: string | null
      price: number
      image: string | null
      reviews: number
      stock: number
      rating: number
      category_id: number
    }>(`
      SELECT 
        id, 
        name, 
        description, 
        price, 
        image, 
        reviews, 
        stock, 
        rating, 
        category_id
      FROM products
      ORDER BY id  // Ensures consistent ordering
    `)

    return NextResponse.json(result.rows)  // Return raw rows without transformation
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}

// POST — add a new product
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      name, 
      description, 
      price, 
      image, 
      reviews = 0, 
      stock = 0, 
      rating = 0, 
      category_id  // Changed from 'category' to match DB column
    } = data

    // Validation
    if (!name || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Name and valid price are required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `
      INSERT INTO products (
        name, description, price, image, 
        reviews, stock, rating, category_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, description, price, image
      `,
      [
        name.trim(),
        description?.trim() || null,
        price,
        image?.trim() || null,
        reviews,
        stock,
        rating,
        category_id
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add product',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}
