import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database'
import { serverStoreManager } from '@/lib/server-store'

export async function POST() {
  try {
    console.log('Initializing database...')

    // Initialize database structure
    await initializeDatabase()

    // Add sample products if none exist
    const existingProducts = await serverStoreManager.getProducts()

    if (existingProducts.length === 0) {
      console.log('Adding sample products...')

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
        },
        {
          id: "5",
          name: "Smart Fitness Watch",
          price: 149.99,
          stock: 40,
          category: "electronics",
          image: "/placeholder.svg?height=300&width=300",
          description: "Track your fitness goals with advanced health monitoring.",
          rating: 4.3,
          reviews: 92
        },
        {
          id: "6",
          name: "Organic Cotton T-Shirt",
          price: 24.99,
          stock: 75,
          category: "fashion",
          image: "/placeholder.svg?height=300&width=300",
          description: "Comfortable and sustainable organic cotton tee.",
          rating: 4.1,
          reviews: 67
        },
        {
          id: "7",
          name: "Kitchen Knife Set",
          price: 89.99,
          stock: 20,
          category: "home-living",
          image: "/placeholder.svg?height=300&width=300",
          description: "Professional-grade kitchen knives for home chefs.",
          rating: 4.6,
          reviews: 134
        },
        {
          id: "8",
          name: "Natural Face Serum",
          price: 45.99,
          stock: 60,
          category: "beauty",
          image: "/placeholder.svg?height=300&width=300",
          description: "Anti-aging serum with natural ingredients.",
          rating: 4.4,
          reviews: 89
        }
      ]

      for (const product of sampleProducts) {
        await serverStoreManager.addProduct(product)
      }

      console.log('Sample products added successfully')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      productsCount: (await serverStoreManager.getProducts()).length
    })

  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to initialize database' 
  })
}