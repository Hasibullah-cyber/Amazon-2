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
        // Electronics
        {
          id: "1",
          name: "Premium Wireless Headphones",
          price: 199.99,
          stock: 50,
          category: "electronics",
          image: "/placeholder.svg?height=300&width=300",
          description: "Immersive sound quality with noise cancellation technology. Perfect for music lovers and professionals.",
          rating: 4.5,
          reviews: 128
        },
        {
          id: "5",
          name: "Smart Fitness Watch",
          price: 149.99,
          stock: 40,
          category: "electronics",
          image: "/placeholder.svg?height=300&width=300",
          description: "Track your fitness goals with advanced health monitoring, GPS, and waterproof design.",
          rating: 4.3,
          reviews: 92
        },
        {
          id: "9",
          name: "Wireless Charging Pad",
          price: 39.99,
          stock: 80,
          category: "electronics",
          image: "/placeholder.svg?height=300&width=300",
          description: "Fast wireless charging for all Qi-compatible devices with LED indicator.",
          rating: 4.2,
          reviews: 156
        },
        {
          id: "10",
          name: "Bluetooth Speaker",
          price: 79.99,
          stock: 35,
          category: "electronics",
          image: "/placeholder.svg?height=300&width=300",
          description: "Portable speaker with 360-degree sound and 12-hour battery life.",
          rating: 4.4,
          reviews: 201
        },
        
        // Fashion
        {
          id: "2", 
          name: "Designer Sunglasses",
          price: 79.99,
          stock: 30,
          category: "fashion",
          image: "/placeholder.svg?height=300&width=300",
          description: "Protect your eyes with style and elegance. UV400 protection with premium frames.",
          rating: 4.0,
          reviews: 85
        },
        {
          id: "6",
          name: "Organic Cotton T-Shirt",
          price: 24.99,
          stock: 75,
          category: "fashion",
          image: "/placeholder.svg?height=300&width=300",
          description: "Comfortable and sustainable organic cotton tee. Available in multiple colors.",
          rating: 4.1,
          reviews: 67
        },
        {
          id: "11",
          name: "Leather Wallet",
          price: 59.99,
          stock: 45,
          category: "fashion",
          image: "/placeholder.svg?height=300&width=300",
          description: "Genuine leather wallet with RFID blocking technology and multiple card slots.",
          rating: 4.6,
          reviews: 89
        },
        {
          id: "12",
          name: "Winter Jacket",
          price: 129.99,
          stock: 25,
          category: "fashion",
          image: "/placeholder.svg?height=300&width=300",
          description: "Water-resistant winter jacket with down insulation and multiple pockets.",
          rating: 4.3,
          reviews: 112
        },
        
        // Home & Living
        {
          id: "3",
          name: "Scented Candle Set",
          price: 34.99,
          stock: 100,
          category: "home-living",
          image: "/placeholder.svg?height=300&width=300",
          description: "Set of 3 premium scented candles for a relaxing atmosphere. Made with soy wax.",
          rating: 4.7,
          reviews: 203
        },
        {
          id: "7",
          name: "Kitchen Knife Set",
          price: 89.99,
          stock: 20,
          category: "home-living",
          image: "/placeholder.svg?height=300&width=300",
          description: "Professional-grade kitchen knives for home chefs. Includes 6 essential knives.",
          rating: 4.6,
          reviews: 134
        },
        {
          id: "13",
          name: "Coffee Maker",
          price: 159.99,
          stock: 15,
          category: "home-living",
          image: "/placeholder.svg?height=300&width=300",
          description: "Programmable coffee maker with thermal carafe and auto-shutoff feature.",
          rating: 4.4,
          reviews: 178
        },
        {
          id: "14",
          name: "Throw Pillow Set",
          price: 29.99,
          stock: 60,
          category: "home-living",
          image: "/placeholder.svg?height=300&width=300",
          description: "Set of 2 decorative throw pillows with removable covers. Multiple patterns available.",
          rating: 4.2,
          reviews: 95
        },
        
        // Beauty
        {
          id: "4",
          name: "Luxury Skincare Set",
          price: 129.99,
          stock: 25,
          category: "beauty",
          image: "/placeholder.svg?height=300&width=300",
          description: "Complete skincare routine with premium ingredients. Includes cleanser, toner, and moisturizer.",
          rating: 4.2,
          reviews: 156
        },
        {
          id: "8",
          name: "Natural Face Serum",
          price: 45.99,
          stock: 60,
          category: "beauty",
          image: "/placeholder.svg?height=300&width=300",
          description: "Anti-aging serum with natural ingredients including vitamin C and hyaluronic acid.",
          rating: 4.4,
          reviews: 89
        },
        {
          id: "15",
          name: "Makeup Brush Set",
          price: 39.99,
          stock: 40,
          category: "beauty",
          image: "/placeholder.svg?height=300&width=300",
          description: "Professional makeup brush set with 12 essential brushes and travel case.",
          rating: 4.5,
          reviews: 123
        },
        {
          id: "16",
          name: "Perfume Collection",
          price: 89.99,
          stock: 30,
          category: "beauty",
          image: "/placeholder.svg?height=300&width=300",
          description: "Set of 3 mini perfumes in different scents - floral, citrus, and woody.",
          rating: 4.1,
          reviews: 167
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