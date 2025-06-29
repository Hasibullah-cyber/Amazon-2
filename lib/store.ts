
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

interface StoreState {
  products: Product[]
  orders: Order[]
  stats: {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    lowStockProducts: number
    recentOrders: Order[]
  }
}

type StoreListener = (state: StoreState) => void

class StoreManager {
  private static instance: StoreManager | null = null
  private listeners: Set<StoreListener> = new Set()
  private state: StoreState = {
    products: [],
    orders: [],
    stats: {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      recentOrders: []
    }
  }

  static getInstance(): StoreManager {
    if (!StoreManager.instance) {
      StoreManager.instance = new StoreManager()
    }
    return StoreManager.instance
  }

  constructor() {
    this.initializeData()
    // Set up periodic sync with server data
    setInterval(() => {
      this.syncWithServer()
    }, 30000) // Sync every 30 seconds
  }

  private async initializeData() {
    try {
      await this.syncWithServer()
    } catch (error) {
      console.error('Failed to initialize store data:', error)
    }
  }

  private async syncWithServer() {
    try {
      console.log('Syncing store data with server...')

      // Fetch fresh data from API endpoints
      const [productsResponse, ordersResponse, statsResponse] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/admin/orders').catch(() => null),
        fetch('/api/admin/stats').catch(() => null)
      ])

      let products: Product[] = []
      let orders: Order[] = []
      let stats = this.state.stats

      if (productsResponse?.ok) {
        products = await productsResponse.json()
      }

      if (ordersResponse?.ok) {
        orders = await ordersResponse.json()
      }

      if (statsResponse?.ok) {
        stats = await statsResponse.json()
      }

      // Update state
      this.state = {
        products,
        orders,
        stats
      }

      console.log('Store synced - Products:', products.length, 'Orders:', orders.length)

      // Notify all listeners
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to sync with server:', error)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state)
      } catch (error) {
        console.error('Error notifying listener:', error)
      }
    })
  }

  // Public API methods
  async getProducts(): Promise<Product[]> {
    if (this.state.products.length === 0) {
      await this.syncWithServer()
    }
    return this.state.products
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const products = await this.getProducts()
    let product = products.find(p => p.id === id)
    
    if (!product) {
      try {
        const response = await fetch(`/api/products?id=${id}`)
        if (response.ok) {
          const data = await response.json()
          product = data.find((p: Product) => p.id === id)
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      }
    }
    
    return product
  }

  async getOrders(): Promise<Order[]> {
    if (this.state.orders.length === 0) {
      await this.syncWithServer()
    }
    return this.state.orders
  }

  async getUserOrders(userEmail: string): Promise<Order[]> {
    try {
      const response = await fetch(`/api/user-orders?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch user orders:', error)
    }
    return []
  }

  async addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    try {
      console.log('Adding new order:', order.orderId)
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const newOrder = await response.json()

      // Immediately sync to update local state
      await this.syncWithServer()

      // Show notification
      this.showNotification(`New order received: ${newOrder.orderId}`, 'success')

      return newOrder
    } catch (error) {
      console.error('Failed to add order:', error)
      this.showNotification('Failed to create order', 'error')
      throw error
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      console.log('Updating order status:', orderId, 'to', status)
      
      const response = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Immediately sync to update local state
      await this.syncWithServer()

      // Show notification
      this.showNotification(`Order ${orderId} status updated to ${status}`, 'success')
    } catch (error) {
      console.error('Failed to update order status:', error)
      this.showNotification('Failed to update order status', 'error')
      throw error
    }
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      console.log('Adding new product:', product.name)
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        throw new Error('Failed to add product')
      }

      const newProduct = await response.json()

      // Immediately sync to update local state
      await this.syncWithServer()

      // Show notification
      this.showNotification(`Product added: ${newProduct.name}`, 'success')

      return newProduct
    } catch (error) {
      console.error('Failed to add product:', error)
      this.showNotification('Failed to add product', 'error')
      throw error
    }
  }

  async updateProductStock(productId: string, quantity: number): Promise<void> {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product stock')
      }

      // Immediately sync to update local state
      await this.syncWithServer()
    } catch (error) {
      console.error('Failed to update product stock:', error)
      throw error
    }
  }

  async getStats() {
    if (this.state.orders.length === 0) {
      await this.syncWithServer()
    }
    return this.state.stats
  }

  // Subscription management
  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener)

    // Immediately call with current state
    listener(this.state)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Real-time notifications
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    // Create and dispatch custom event for notifications
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('store-notification', {
        detail: { message, type, timestamp: Date.now() }
      })
      window.dispatchEvent(event)
    }
  }

  // Force refresh data
  async refresh(): Promise<void> {
    await this.syncWithServer()
  }

  // Get current state snapshot
  getState(): StoreState {
    return { ...this.state }
  }
}

// Export singleton instance
export const storeManager = StoreManager.getInstance()

// Export types
export type { Product, Order, StoreState, StoreListener }
