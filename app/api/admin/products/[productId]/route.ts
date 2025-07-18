import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ PUT — update product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params
    const data = await request.json()

    const {
      name,
      description,
      price,
      category,
      subcategory = null,
      image = '/placeholder.svg',
      stock = 0,
      rating = 0,
      reviews = 0
    } = data

    const result = await pool.query(
      `
      UPDATE products SET 
        name = $1,
        description = $2,
        price = $3,
        category_id = $4,
        subcategory = $5,
        image = $6,
        stock = $7,
        rating = $8,
        reviews = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        name,
        description,
        price,
        category,
        subcategory,
        image,
        stock,
        rating,
        reviews,
        productId
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 })
  }
}

// ✅ DELETE — delete product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params

    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [productId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      deletedProduct: result.rows[0]
    })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 })
  }
}
