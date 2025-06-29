
import 'server-only'
import { pool, initializeDatabase } from "./database"
import { notificationService } from "./notifications"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
  description: string
  rating?: number
  reviews?: number
}

interface Order {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  subtotal: number
  shipping: number
  vat: number
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  paymentMethod: string
  createdAt: string
  estimatedDelivery: string
}

class ServerStoreManager {
  private static instance: ServerStoreManager | null = null
  private dbInitialized = false

  constructor() {
    this.initializeDb().catch(error => {
      console.warn('Database initialization failed, running in demo mode:', error.message)
    })
  }

  static getInstance(): ServerStoreManager {
    if (!ServerStoreManager.instance) {
      ServerStoreManager.instance = new ServerStoreManager()
    }
    return ServerStoreManager.instance
  }

  private async initializeDb() {
    if (this.dbInitialized) return
    
    try {
      await initializeDatabase()
      this.dbInitialized = true
    } catch (error) {
      console.warn('Failed to initialize database:', error)
      this.dbInitialized = true
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const client = await pool.connect()
      
      try {
        const result = await client.query(`
          SELECT id, name, price, stock, category, image, description 
          FROM products 
          ORDER BY name
        `)
        
        // Add rating and reviews to products
        return result.rows.map(product => ({
          ...product,
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          reviews: Math.floor(Math.random() * 200) + 50 // Random reviews 50-250
        }))
      } finally {
        client.release()
      }
    } catch (error) {
      console.warn('Database not available, returning sample products')
      return this.getSampleProducts()
    }
  }

  private getSampleProducts(): Product[] {
    return [
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
        description: "Track your health metrics and stay connected on the go.",
        rating: 4.3,
        reviews: 95
      },
      {
        id: "6",
        name: "Organic Coffee Beans",
        price: 24.99,
        stock: 200,
        category: "food",
        image: "/placeholder.svg?height=300&width=300",
        description: "Premium organic coffee beans from sustainable farms.",
        rating: 4.6,
        reviews: 312
      },
      {
        id: "7",
        name: "Yoga Mat Set",
        price: 59.99,
        stock: 75,
        category: "sports",
        image: "/placeholder.svg?height=300&width=300",
        description: "Non-slip yoga mat with carrying strap and blocks.",
        rating: 4.4,
        reviews: 189
      },
      {
        id: "8",
        name: "LED Desk Lamp",
        price: 39.99,
        stock: 60,
        category: "home-living",
        image: "/placeholder.svg?height=300&width=300",
        description: "Adjustable LED desk lamp with touch controls.",
        rating: 4.1,
        reviews: 78
      }
    ]
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const client = await pool.connect()
      
      try {
        const result = await client.query(`
          SELECT id, name, price, stock, category, image, description 
          FROM products 
          WHERE id = $1
        `, [id])
        
        if (result.rows.length > 0) {
          return {
            ...result.rows[0],
            rating: Math.random() * 2 + 3,
            reviews: Math.floor(Math.random() * 200) + 50
          }
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.warn('Database not available, using sample data')
    }
    
    // Fallback to sample products
    return this.getSampleProducts().find(p => p.id === id)
  }

  async addProduct(product: Omit<Product, 'id'>) {
    try {
      const client = await pool.connect()
      
      try {
        const newProduct: Product = {
          ...product,
          id: Date.now().toString()
        }

        await client.query(`
          INSERT INTO products (id, name, price, stock, category, image, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          newProduct.id, newProduct.name, newProduct.price, newProduct.stock,
          newProduct.category, newProduct.image, newProduct.description
        ])

        return newProduct
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  async addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    try {
      const client = await pool.connect()
      
      try {
        const newOrder: Order = {
          ...order,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }

        await client.query(`
          INSERT INTO orders (
            id, order_id, customer_name, customer_email, customer_phone,
            address, city, items, subtotal, shipping, vat, total_amount,
            status, payment_method, estimated_delivery, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
          newOrder.id, newOrder.orderId, newOrder.customerName, newOrder.customerEmail,
          newOrder.customerPhone, newOrder.address, newOrder.city, JSON.stringify(newOrder.items),
          newOrder.subtotal, newOrder.shipping, newOrder.vat, newOrder.totalAmount,
          newOrder.status, newOrder.paymentMethod, newOrder.estimatedDelivery, newOrder.createdAt
        ])

        return newOrder
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error adding order:', error)
      throw error
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const client = await pool.connect()
      
      try {
        const result = await client.query(`
          SELECT 
            id, order_id as "orderId", customer_name as "customerName",
            customer_email as "customerEmail", customer_phone as "customerPhone",
            address, city, items, subtotal, shipping, vat, total_amount as "totalAmount",
            status, payment_method as "paymentMethod", estimated_delivery as "estimatedDelivery",
            created_at as "createdAt"
          FROM orders 
          ORDER BY created_at DESC
        `)
        
        return result.rows.map(row => ({
          ...row,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
        }))
      } finally {
        client.release()
      }
    } catch (error) {
      console.warn('Database not available for orders')
      return []
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      const client = await pool.connect()
      
      try {
        await client.query(`
          UPDATE orders 
          SET status = $1, updated_at = NOW() 
          WHERE id = $2
        `, [status, orderId])
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }
}

export const serverStoreManager = ServerStoreManager.getInstance()

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
  description: string
}

interface Order {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  subtotal: number
  shipping: number
  vat: number
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  paymentMethod: string
  createdAt: string
  estimatedDelivery: string
}

class ServerStoreManager {
  constructor() {
    this.initializeDb()
  }

  private async initializeDb() {
    try {
      await initializeDatabase()
    } catch (error) {
      console.error('Failed to initialize database:', error)
    }
  }

  // Orders management
  async addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    const client = await pool.connect()
    
    try {
      const newOrder: Order = {
        ...order,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }

      await client.query(`
        INSERT INTO orders (
          id, order_id, customer_name, customer_email, customer_phone,
          address, city, items, subtotal, shipping, vat, total_amount,
          status, payment_method, estimated_delivery, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        newOrder.id, newOrder.orderId, newOrder.customerName, newOrder.customerEmail,
        newOrder.customerPhone, newOrder.address, newOrder.city, JSON.stringify(newOrder.items),
        newOrder.subtotal, newOrder.shipping, newOrder.vat, newOrder.totalAmount,
        newOrder.status, newOrder.paymentMethod, newOrder.estimatedDelivery, newOrder.createdAt
      ])

      // Update inventory
      for (const item of order.items) {
        await this.updateProductStock(item.id, -item.quantity)
      }

      notificationService.sendOrderConfirmation(newOrder)
      return newOrder
    } finally {
      client.release()
    }
  }

  async getOrders(): Promise<Order[]> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          id, order_id as "orderId", customer_name as "customerName",
          customer_email as "customerEmail", customer_phone as "customerPhone",
          address, city, items, subtotal, shipping, vat, total_amount as "totalAmount",
          status, payment_method as "paymentMethod", estimated_delivery as "estimatedDelivery",
          created_at as "createdAt"
        FROM orders 
        ORDER BY created_at DESC
      `)
      
      return result.rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }))
    } finally {
      client.release()
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const client = await pool.connect()
    
    try {
      await client.query(`
        UPDATE orders 
        SET status = $1, updated_at = NOW() 
        WHERE id = $2
      `, [status, orderId])

      const orderResult = await client.query(`
        SELECT 
          id, order_id as "orderId", customer_name as "customerName",
          customer_email as "customerEmail", customer_phone as "customerPhone",
          address, city, items, subtotal, shipping, vat, total_amount as "totalAmount",
          status, payment_method as "paymentMethod", estimated_delivery as "estimatedDelivery",
          created_at as "createdAt"
        FROM orders WHERE id = $1
      `, [orderId])

      if (orderResult.rows.length > 0) {
        const order = {
          ...orderResult.rows[0],
          items: JSON.parse(orderResult.rows[0].items)
        }
        notificationService.sendOrderStatusUpdate(order, status)
      }
    } finally {
      client.release()
    }
  }

  // Products management
  async getProducts(): Promise<Product[]> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT id, name, price, stock, category, image, description 
        FROM products 
        ORDER BY name
      `)
      return result.rows
    } finally {
      client.release()
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT id, name, price, stock, category, image, description 
        FROM products 
        WHERE id = $1
      `, [id])
      return result.rows[0]
    } finally {
      client.release()
    }
  }

  async updateProductStock(productId: string, quantity: number) {
    const client = await pool.connect()
    
    try {
      await client.query(`
        UPDATE products 
        SET stock = GREATEST(0, stock + $1), updated_at = NOW() 
        WHERE id = $2
      `, [quantity, productId])
    } finally {
      client.release()
    }
  }

  async addProduct(product: Omit<Product, 'id'>) {
    const client = await pool.connect()
    
    try {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString()
      }

      await client.query(`
        INSERT INTO products (id, name, price, stock, category, image, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        newProduct.id, newProduct.name, newProduct.price, newProduct.stock,
        newProduct.category, newProduct.image, newProduct.description
      ])

      return newProduct
    } finally {
      client.release()
    }
  }

  // Statistics
  async getStats() {
    const client = await pool.connect()
    
    try {
      const ordersResult = await client.query('SELECT COUNT(*) as total, SUM(total_amount) as revenue FROM orders')
      const pendingResult = await client.query('SELECT COUNT(*) as pending FROM orders WHERE status = $1', ['pending'])
      const lowStockResult = await client.query('SELECT COUNT(*) as low_stock FROM products WHERE stock < 10')
      const recentOrdersResult = await client.query(`
        SELECT 
          id, order_id as "orderId", customer_name as "customerName",
          customer_email as "customerEmail", items, total_amount as "totalAmount",
          status, created_at as "createdAt"
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 5
      `)

      return {
        totalOrders: parseInt(ordersResult.rows[0].total) || 0,
        totalRevenue: parseFloat(ordersResult.rows[0].revenue) || 0,
        pendingOrders: parseInt(pendingResult.rows[0].pending) || 0,
        lowStockProducts: parseInt(lowStockResult.rows[0].low_stock) || 0,
        recentOrders: recentOrdersResult.rows.map(row => ({
          ...row,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
        }))
      }
    } finally {
      client.release()
    }
  }
}

let serverStoreManagerInstance: ServerStoreManager | null = null

export const serverStoreManager = (() => {
  if (!serverStoreManagerInstance) {
    serverStoreManagerInstance = new ServerStoreManager()
  }
  return serverStoreManagerInstance
})()
import { pool, initializeDatabase } from "./database"
import { notificationService } from "./notifications"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
  description: string
  rating?: number
  reviews?: number
}

interface Order {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  subtotal: number
  shipping: number
  vat: number
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  paymentMethod: string
  createdAt: string
  estimatedDelivery: string
}

class ServerStoreManager {
  private static instance: ServerStoreManager | null = null
  private dbInitialized = false

  constructor() {
    this.initializeDb().catch(error => {
      console.warn('Database initialization failed, running in demo mode:', error.message)
    })
  }

  static getInstance(): ServerStoreManager {
    if (!ServerStoreManager.instance) {
      ServerStoreManager.instance = new ServerStoreManager()
    }
    return ServerStoreManager.instance
  }

  private async initializeDb() {
    if (this.dbInitialized) return
    
    try {
      await initializeDatabase()
      this.dbInitialized = true
    } catch (error) {
      console.warn('Failed to initialize database:', error)
      this.dbInitialized = true
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const client = await pool.connect()
      
      try {
        const result = await client.query(`
          SELECT id, name, price, stock, category, image, description 
          FROM products 
          ORDER BY name
        `)
        
        // Add rating and reviews to products
        return result.rows.map(product => ({
          ...product,
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          reviews: Math.floor(Math.random() * 200) + 50 // Random reviews 50-250
        }))
      } finally {
        client.release()
      }
    } catch (error) {
      console.warn('Database not available, returning sample products')
      return this.getSampleProducts()
    }
  }

  private getSampleProducts(): Product[] {
    return [
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
        description: "Track your health metrics and stay connected on the go.",
        rating: 4.3,
        reviews: 95
      },
      {
        id: "6",
        name: "Organic Coffee Beans",
        price: 24.99,
        stock: 200,
        category: "food",
        image: "/placeholder.svg?height=300&width=300",
        description: "Premium organic coffee beans from sustainable farms.",
        rating: 4.6,
        reviews: 312
      },
      {
        id: "7",
        name: "Yoga Mat Set",
        price: 59.99,
        stock: 75,
        category: "sports",
        image: "/placeholder.svg?height=300&width=300",
        description: "Non-slip yoga mat with carrying strap and blocks.",
        rating: 4.4,
        reviews: 189
      },
      {
        id: "8",
        name: "LED Desk Lamp",
        price: 39.99,
        stock: 60,
        category: "home-living",
        image: "/placeholder.svg?height=300&width=300",
        description: "Adjustable LED desk lamp with touch controls.",
        rating: 4.1,
        reviews: 78
      }
    ]
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const client = await pool.connect()
      
      try {
        const result = await client.query(`
          SELECT id, name, price, stock, category, image, description 
          FROM products 
          WHERE id = $1
        `, [id])
        
        if (result.rows.length > 0) {
          return {
            ...result.rows[0],
            rating: Math.random() * 2 + 3,
            reviews: Math.floor(Math.random() * 200) + 50
          }
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.warn('Database not available, using sample data')
    }
    
    // Fallback to sample products
    return this.getSampleProducts().find(p => p.id === id)
  }

  async addProduct(product: Omit<Product, 'id'>) {
    try {
      const client = await pool.connect()
      
      try {
        const newProduct: Product = {
          ...product,
          id: Date.now().toString()
        }

        await client.query(`
          INSERT INTO products (id, name, price, stock, category, image, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          newProduct.id, newProduct.name, newProduct.price, newProduct.stock,
          newProduct.category, newProduct.image, newProduct.description
        ])

        return newProduct
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  async addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    try {
      const client = await pool.connect()
      
      try {
        const newOrder: Order = {
          ...order,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }

        await client.query(`
          INSERT INTO orders (
            id, order_id, customer_name, customer_email, customer_phone,
            address, city, items, subtotal, shipping, vat, total_amount,
            status, payment_method, estimated_delivery, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
          newOrder.id, newOrder.orderId, newOrder.customerName, newOrder.customerEmail,
          newOrder.customerPhone, newOrder.address, newOrder.city, JSON.stringify(newOrder.items),
          newOrder.subtotal, newOrder.shipping, newOrder.vat, newOrder.totalAmount,
          newOrder.status, newOrder.paymentMethod, newOrder.estimatedDelivery, newOrder.createdAt
        ])

        return newOrder
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error adding order:', error)
      throw error
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const client = await pool.connect()
      
      try {
        const result = await client.query(`
          SELECT 
            id, order_id as "orderId", customer_name as "customerName",
            customer_email as "customerEmail", customer_phone as "customerPhone",
            address, city, items, subtotal, shipping, vat, total_amount as "totalAmount",
            status, payment_method as "paymentMethod", estimated_delivery as "estimatedDelivery",
            created_at as "createdAt"
          FROM orders 
          ORDER BY created_at DESC
        `)
        
        return result.rows.map(row => ({
          ...row,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
        }))
      } finally {
        client.release()
      }
    } catch (error) {
      console.warn('Database not available for orders')
      return []
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      const client = await pool.connect()
      
      try {
        await client.query(`
          UPDATE orders 
          SET status = $1, updated_at = NOW() 
          WHERE id = $2
        `, [status, orderId])
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }
}

export const serverStoreManager = ServerStoreManager.getInstance()
