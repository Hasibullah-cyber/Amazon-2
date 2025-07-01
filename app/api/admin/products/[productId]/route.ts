
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await request.json()
    const productId = params.productId
    
    const client = await pool.connect()
    try {
      const result = await client.query(`
        UPDATE products SET 
          name = $1, description = $2, price = $3, category = $4, 
          subcategory = $5, image = $6, stock = $7, rating = $8, reviews = $9
        WHERE id = $10
        RETURNING *
      `, [
        product.name,
        product.description,
        product.price,
        product.category,
        product.subcategory,
        product.image,
        product.stock,
        product.rating,
        product.reviews,
        productId
      ])
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json(result.rows[0])
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId
    
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [productId]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, deletedProduct: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
