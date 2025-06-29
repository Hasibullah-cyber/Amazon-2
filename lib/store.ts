import { serverStoreManager } from './server-store'

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

      // Fetch fresh data from server
      const [products, orders, stats] = await Promise.all([
        serverStoreManager.getProducts(),
        serverStoreManager.getOrders(),
        serverStoreManager.getStats()
      ])

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
    return products.find(p => p.id === id) || await serverStoreManager.getProduct(id)
  }

  async getOrders(): Promise<Order[]> {
    if (this.state.orders.length === 0) {
      await this.syncWithServer()
    }
    return this.state.orders
  }

  async getUserOrders(userEmail: string): Promise<Order[]> {
    const orders = await this.getOrders()
    return orders.filter(order => order.customerEmail === userEmail)
  }

  async addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    try {
      console.log('Adding new order:', order.orderId)
      const newOrder = await serverStoreManager.addOrder(order)

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
      await serverStoreManager.updateOrderStatus(orderId, status)

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
      const newProduct = await serverStoreManager.addProduct(product)

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
      await serverStoreManager.updateProductStock(productId, quantity)

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