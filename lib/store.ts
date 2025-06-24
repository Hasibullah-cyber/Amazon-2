

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

class StoreManager {
  private listeners: Array<() => void> = []

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

      this.notifyListeners()
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

      this.notifyListeners()
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
      
      this.notifyListeners()
    } finally {
      client.release()
    }
  }

  async updateProduct(productId: string, updates: Partial<Product>) {
    const client = await pool.connect()
    
    try {
      const setClauses = []
      const values = []
      let valueIndex = 1

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id') {
          setClauses.push(`${key} = $${valueIndex}`)
          values.push(value)
          valueIndex++
        }
      })

      if (setClauses.length > 0) {
        setClauses.push(`updated_at = NOW()`)
        values.push(productId)

        await client.query(`
          UPDATE products 
          SET ${setClauses.join(', ')} 
          WHERE id = $${valueIndex}
        `, values)

        this.notifyListeners()
      }
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

      this.notifyListeners()
      return newProduct
    } finally {
      client.release()
    }
  }

  // Category management
  async getCategories() {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT id, name, description, subcategories 
        FROM categories 
        ORDER BY name
      `)
      
      return result.rows.map(row => ({
        ...row,
        subcategories: typeof row.subcategories === 'string' ? 
          JSON.parse(row.subcategories) : row.subcategories
      }))
    } finally {
      client.release()
    }
  }

  async addCategory(category: { name: string; description: string; subcategories?: any[] }) {
    const client = await pool.connect()
    
    try {
      const newCategory = {
        ...category,
        id: category.name.toLowerCase().replace(/\s+/g, '-'),
        subcategories: category.subcategories || []
      }

      await client.query(`
        INSERT INTO categories (id, name, description, subcategories)
        VALUES ($1, $2, $3, $4)
      `, [
        newCategory.id, newCategory.name, newCategory.description,
        JSON.stringify(newCategory.subcategories)
      ])

      this.notifyListeners()
      return newCategory
    } finally {
      client.release()
    }
  }

  async updateCategory(categoryId: string, updates: any) {
    const client = await pool.connect()
    
    try {
      const setClauses = []
      const values = []
      let valueIndex = 1

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id') {
          setClauses.push(`${key} = $${valueIndex}`)
          values.push(key === 'subcategories' ? JSON.stringify(value) : value)
          valueIndex++
        }
      })

      if (setClauses.length > 0) {
        setClauses.push(`updated_at = NOW()`)
        values.push(categoryId)

        await client.query(`
          UPDATE categories 
          SET ${setClauses.join(', ')} 
          WHERE id = $${valueIndex}
        `, values)

        this.notifyListeners()
      }
    } finally {
      client.release()
    }
  }

  async addSubcategory(categoryId: string, subcategory: { name: string; description: string }) {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT subcategories FROM categories WHERE id = $1
      `, [categoryId])

      if (result.rows.length > 0) {
        const subcategories = JSON.parse(result.rows[0].subcategories || '[]')
        const newSubcategory = {
          ...subcategory,
          id: subcategory.name.toLowerCase().replace(/\s+/g, '-')
        }
        subcategories.push(newSubcategory)

        await client.query(`
          UPDATE categories 
          SET subcategories = $1, updated_at = NOW() 
          WHERE id = $2
        `, [JSON.stringify(subcategories), categoryId])

        this.notifyListeners()
      }
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

  // Listeners for real-time updates
  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }
}

export const storeManager = new StoreManager()

