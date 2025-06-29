
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
          name: "Premium Wireless Headphones",
          price: 199.99,
          stock: 50,
          category: "electronics",
          image: "/placeholder.svg?height=300&width=300",
          description: "Immersive sound quality with noise cancellation technology."
        },
        {
          name: "Designer Sunglasses",
          price: 79.99,
          stock: 30,
          category: "fashion",
          image: "/placeholder.svg?height=300&width=300",
          description: "Protect your eyes with style and elegance."
        },
        {
          name: "Scented Candle Set",
          price: 34.99,
          stock: 100,
          category: "home-living",
          image: "/placeholder.svg?height=300&width=300",
          description: "Set of 3 premium scented candles for a relaxing atmosphere."
        },
        {
          name: "Luxury Skincare Set",
          price: 129.99,
          stock: 25,
          category: "beauty",
          image: "/placeholder.svg?height=300&width=300",
          description: "Complete skincare routine with premium ingredients."
        },
        {
          name: "Smart Fitness Watch",
          price: 149.99,
          stock: 40,
          category: "electronics",
          image: "/placeholder.svg?height=300&width=300",
          description: "Track your health metrics and stay connected on the go."
        },
        {
          name: "Organic Coffee Beans",
          price: 24.99,
          stock: 200,
          category: "food",
          image: "/placeholder.svg?height=300&width=300",
          description: "Premium organic coffee beans from sustainable farms."
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
