import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { NextRequest } from 'next/server';
import { serverStoreManager } from '@/lib/server-store';

export async function GET() {
  try {
    const client = await pool.connect()

    try {
      const result = await client.query(`
        SELECT id, name, price, stock, category, image, description 
        FROM products 
        ORDER BY name
      `)

      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()
    const newProduct = await serverStoreManager.addProduct(productData)
    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { productId, updates } = await request.json()

    if (!productId || !updates) {
      return NextResponse.json({ error: 'Product ID and updates are required' }, { status: 400 })
    }

    await serverStoreManager.updateProduct(productId, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { productId, quantity } = await request.json()

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 })
    }

    await serverStoreManager.updateProductStock(productId, quantity)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating product stock:', error)
    return NextResponse.json({ error: 'Failed to update product stock' }, { status: 500 })
  }
}