import { NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'

export async function GET() {
  try {
    console.log('API: Fetching products...')
    const products = await storeManager.getProducts()
    console.log('API: Returning', products.length, 'products')
    return NextResponse.json(products)
  } catch (error) {
    console.error('API: Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()
    console.log('API: Adding new product:', product.name)
    const newProduct = await storeManager.addProduct(product)
    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('API: Error adding product:', error)
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}