
import { NextResponse } from 'next/server'
import { serverStoreManager } from '@/lib/server-store'

export async function GET() {
  try {
    const products = await serverStoreManager.getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()
    const newProduct = await storeManager.addProduct(product)
    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}
