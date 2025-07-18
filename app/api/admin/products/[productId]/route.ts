import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

// ✅ Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params

  try {
    const data = await req.json()
    const {
      name,
      description,
      price,
      category,
      subcategory,
      image,
      stock,
      rating,
      reviews
    } = data

    const result = await pool.query(
      `
      UPDATE products SET
        name = $1,
        description = $2,
        price = $3,
        category = $4,
        subcategory = $5,
        image = $6,
        stock = $7,
        rating = $8,
        reviews = $9
      WHERE id = $10
      RETURNING *
      `,
      [name, description, price, category, subcategory, image, stock, rating, reviews, productId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('PUT /product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// ✅ Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [productId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: result.rows[0] })
  } catch (error) {
    console.error('DELETE /product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
