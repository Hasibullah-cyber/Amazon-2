
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT * FROM products ORDER BY created_at DESC
      `)
      
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error fetching products, using fallback:', error)
    
    // Fallback products
    const fallbackProducts = [
      {
        id: "1",
        name: "Sample Product",
        description: "This is a sample product",
        price: 99.99,
        category: "Electronics",
        subcategory: "Headphones",
        image: "/placeholder.svg",
        stock: 50,
        rating: 4.5,
        reviews: 123,
        created_at: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(fallbackProducts)
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()
    
    const client = await pool.connect()
    try {
      const result = await client.query(`
        INSERT INTO products (
          name, description, price, category, subcategory, 
          image, stock, rating, reviews, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        product.name,
        product.description,
        product.price,
        product.category,
        product.subcategory,
        product.image || '/placeholder.svg',
        product.stock || 0,
        product.rating || 0,
        product.reviews || 0,
        new Date().toISOString()
      ])

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
