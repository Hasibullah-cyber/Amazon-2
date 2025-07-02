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

import { executeQuery } from './database'

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

        return result.rows
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

        // Set appropriate payment status based on payment method
        const paymentStatus = order.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'
        const orderStatus = order.paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending'

        await client.query(`
          INSERT INTO orders (
            id, order_id, customer_name, customer_email, customer_phone,
            address, city, items, subtotal, shipping, vat, total_amount,
            status, payment_method, payment_status, estimated_delivery, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          newOrder.id, newOrder.orderId, newOrder.customerName, newOrder.customerEmail,
          newOrder.customerPhone, newOrder.address, newOrder.city, JSON.stringify(newOrder.items),
          newOrder.subtotal, newOrder.shipping, newOrder.vat, newOrder.totalAmount,
          orderStatus, newOrder.paymentMethod, paymentStatus, newOrder.estimatedDelivery, newOrder.createdAt
        ])

        // Update inventory for each item
        for (const item of order.items) {
          await this.updateProductStock(item.id, -item.quantity)
        }

        // Send notification
        notificationService.sendOrderConfirmation(newOrder)
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

        // Get updated order for notification
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
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  async updateProduct(productId: string, updates: Partial<Product>) {
    try {
      const client = await pool.connect()

      try {
        const setClause = Object.keys(updates)
          .map((key, index) => `${key} = $${index + 2}`)
          .join(', ')

        const values = [productId, ...Object.values(updates)]

        await client.query(`
          UPDATE products 
          SET ${setClause}, updated_at = NOW() 
          WHERE id = $1
        `, values)
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  async updateProductStock(productId: string, quantity: number) {
    try {
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
    } catch (error) {
      console.error('Error updating product stock:', error)
      throw error
    }
  }

  async getStats() {
    try {
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
    } catch (error) {
      console.warn('Database not available for stats')
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        recentOrders: []
      }
    }
  }

  async getAdminStats() {
    if (!pool) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        monthlyRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        recentOrders: [],
        salesTrend: [],
        topProducts: [],
        orderStatusDistribution: {}
      }
    }

    try {
      const client = await pool.connect()
      try {
        // Get comprehensive stats with proper error handling
        const [
          ordersResult,
          pendingResult,
          lowStockResult,
          customersResult,
          productsResult,
          recentOrdersResult,
          monthlyRevenueResult,
          dailySalesResult,
          topProductsResult,
          statusDistributionResult
        ] = await Promise.all([
          client.query('SELECT COUNT(*)::integer as total, COALESCE(SUM(total_amount), 0)::float as revenue FROM orders'),
          client.query('SELECT COUNT(*)::integer as pending FROM orders WHERE status = $1', ['pending']),
          client.query('SELECT COUNT(*)::integer as low_stock FROM products WHERE stock < 10 AND is_active = true'),
          client.query('SELECT COUNT(*)::integer as total FROM users WHERE is_active = true'),
          client.query('SELECT COUNT(*)::integer as total FROM products WHERE is_active = true'),
          client.query(`
            SELECT 
              id, order_id as "orderId", customer_name as "customerName",
              customer_email as "customerEmail", items, total_amount as "totalAmount",
              status, payment_method as "paymentMethod", payment_status as "paymentStatus",
              created_at as "createdAt"
            FROM orders 
            ORDER BY created_at DESC 
            LIMIT 10
          `),
          client.query(`
            SELECT 
              COALESCE(SUM(total_amount), 0)::float as revenue 
            FROM orders 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
              AND status NOT IN ('cancelled', 'refunded')
          `),
          client.query(`
            SELECT 
              DATE(created_at) as date,
              COUNT(*)::integer as orders,
              COALESCE(SUM(total_amount), 0)::float as revenue
            FROM orders 
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
              AND status NOT IN ('cancelled', 'refunded')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 30
          `),
          client.query(`
            SELECT 
              p.name as "productName",
              p.id as "productId",
              COALESCE(SUM(oi.quantity), 0)::integer as "totalSold",
              COALESCE(SUM(oi.total_price), 0)::float as "totalRevenue"
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            WHERE o.status NOT IN ('cancelled', 'refunded') OR o.status IS NULL
            GROUP BY p.id, p.name
            ORDER BY "totalSold" DESC
            LIMIT 10
          `),
          client.query(`
            SELECT 
              status,
              COUNT(*)::integer as count
            FROM orders
            GROUP BY status
          `)
        ])

        // Process status distribution
        const statusDistribution: { [key: string]: number } = {}
        statusDistributionResult.rows.forEach(row => {
          statusDistribution[row.status] = row.count
        })

        return {
          totalOrders: ordersResult.rows[0]?.total || 0,
          totalRevenue: ordersResult.rows[0]?.revenue || 0,
          pendingOrders: pendingResult.rows[0]?.pending || 0,
          lowStockProducts: lowStockResult.rows[0]?.low_stock || 0,
          monthlyRevenue: monthlyRevenueResult.rows[0]?.revenue || 0,
          totalCustomers: customersResult.rows[0]?.total || 0,
          totalProducts: productsResult.rows[0]?.total || 0,
          recentOrders: recentOrdersResult.rows.map(row => ({
            ...row,
            items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
            createdAt: new Date(row.createdAt).toISOString()
          })),
          salesTrend: dailySalesResult.rows,
          topProducts: topProductsResult.rows,
          orderStatusDistribution: statusDistribution
        }
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Database error in getAdminStats:', error)
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        monthlyRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        recentOrders: [],
        salesTrend: [],
        topProducts: [],
        orderStatusDistribution: {}
      }
    }
  }

  async getOrders(limit: number = 50, offset: number = 0) {
    if (!pool) return []

    try {
      const result = await executeQuery(`
        SELECT 
          id, order_id as "orderId", customer_name as "customerName",
          customer_email as "customerEmail", customer_phone as "customerPhone",
          address, city, items, total_amount as "totalAmount",
          status, payment_method as "paymentMethod", payment_status as "paymentStatus",
          created_at as "createdAt", estimated_delivery as "estimatedDelivery",
          tracking_number as "trackingNumber"
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset])

      return result.rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
        createdAt: new Date(row.createdAt).toISOString()
      }))
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  async getProducts(limit: number = 50, offset: number = 0) {
    if (!pool) return []

    try {
      const result = await executeQuery(`
        SELECT 
          id, name, price, sale_price as "salePrice", stock, category,
          image, description, featured, is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM products 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset])

      return result.rows.map(row => ({
        ...row,
        createdAt: new Date(row.createdAt).toISOString(),
        updatedAt: new Date(row.updatedAt).toISOString()
      }))
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    if (!pool) return false

    try {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        // Update order status
        await client.query(
          'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2',
          [status, orderId]
        )

        // Add to status history
        await client.query(
          'INSERT INTO order_status_history (order_id, status, notes, created_by) VALUES ($1, $2, $3, $4)',
          [orderId, status, notes || `Status changed to ${status}`, 'admin']
        )

        await client.query('COMMIT')
        return true
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }

  async createProduct(productData: any) {
    if (!pool) return null

    try {
      const result = await executeQuery(`
        INSERT INTO products (
          name, slug, price, sale_price, stock, category, image, description,
          short_description, featured, is_active, sku
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        productData.name,
        productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
        productData.price,
        productData.salePrice || null,
        productData.stock || 0,
        productData.category,
        productData.image || null,
        productData.description || null,
        productData.shortDescription || null,
        productData.featured || false,
        productData.isActive !== false,
        productData.sku || null
      ])

      return result.rows[0]
    } catch (error) {
      console.error('Error creating product:', error)
      return null
    }
  }

  async updateProduct(productId: number, productData: any) {
    if (!pool) return false

    try {
      const result = await executeQuery(`
        UPDATE products SET
          name = $1, price = $2, sale_price = $3, stock = $4,
          category = $5, image = $6, description = $7,
          featured = $8, is_active = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `, [
        productData.name,
        productData.price,
        productData.salePrice || null,
        productData.stock,
        productData.category,
        productData.image,
        productData.description,
        productData.featured || false,
        productData.isActive !== false,
        productId
      ])

      return result.rows.length > 0
    } catch (error) {
      console.error('Error updating product:', error)
      return false
    }
  }

  async deleteProduct(productId: number) {
    if (!pool) return false

    try {
      // Soft delete - mark as inactive instead of deleting
      const result = await executeQuery(
        'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [productId]
      )

      return result.rowCount > 0
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }
}

export const serverStoreManager = ServerStoreManager.getInstance()