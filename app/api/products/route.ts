
import { NextResponse } from 'next/server'
import { serverStoreManager } from '@/lib/server-store'

export async function GET() {
  // Sample products as fallback
  const sampleProducts = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 199.99,
      stock: 50,
      category: "electronics",
      image: "/placeholder.svg?height=300&width=300",
      description: "Immersive sound quality with noise cancellation technology.",
      rating: 4.5,
      reviews: 128
    },
    {
      id: "2", 
      name: "Designer Sunglasses",
      price: 79.99,
      stock: 30,
      category: "fashion",
      image: "/placeholder.svg?height=300&width=300",
      description: "Protect your eyes with style and elegance.",
      rating: 4.0,
      reviews: 85
    },
    {
      id: "3",
      name: "Scented Candle Set", 
      price: 34.99,
      stock: 100,
      category: "home-living",
      image: "/placeholder.svg?height=300&width=300",
      description: "Set of 3 premium scented candles for a relaxing atmosphere.",
      rating: 4.7,
      reviews: 203
    },
    {
      id: "4",
      name: "Luxury Skincare Set",
      price: 129.99,
      stock: 25,
      category: "beauty", 
      image: "/placeholder.svg?height=300&width=300",
      description: "Complete skincare routine with premium ingredients.",
      rating: 4.2,
      reviews: 156
    }
  ]

  try {
    console.log('API: Attempting to fetch products from database...')
    const products = await serverStoreManager.getProducts()
    if (products && products.length > 0) {
      console.log('API: Returning products from database:', products.length)
      return NextResponse.json(products)
    }
    // If no products in database, return sample products
    console.log('API: No products found in database, returning sample products')
    return NextResponse.json(sampleProducts)
  } catch (error) {
    console.error('API: Error fetching products:', error)
    // Return sample products as fallback
    console.log('API: Returning sample products due to error')
    return NextResponse.json(sampleProducts)
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()
    const newProduct = await serverStoreManager.addProduct(product)
    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}
