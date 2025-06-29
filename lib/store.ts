interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
  description: string
  rating: number
  reviews: number
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

interface Category {
  id: string
  name: string
  description: string
}

// Extended product database including mobile phones and other categories
const products: Product[] = [
  // Mobile Phones
  {
    id: "1001",
    name: "iPhone 15 Pro Max",
    description: "Latest Apple smartphone with advanced camera system, titanium design, and A17 Pro chip. Features 6.7-inch Super Retina XDR display with ProMotion technology.",
    price: 1299.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 245,
    stock: 15,
    category: "electronics"
  },
  {
    id: "1002",
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android phone with S Pen, 200MP camera, and AI features. Built-in S Pen for productivity and creativity.",
    price: 1199.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 189,
    stock: 22,
    category: "electronics"
  },
  {
    id: "1003",
    name: "Google Pixel 8 Pro",
    description: "AI-powered photography smartphone with Magic Eraser, Night Sight, and computational photography features.",
    price: 899.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 156,
    stock: 8,
    category: "electronics"
  },
  {
    id: "1004",
    name: "OnePlus 12",
    description: "Flagship killer with Snapdragon 8 Gen 3, 120Hz display, and 100W fast charging. Premium build quality at competitive price.",
    price: 799.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 98,
    stock: 12,
    category: "electronics"
  },
  {
    id: "1005",
    name: "iPhone 14",
    description: "Previous generation iPhone with A15 Bionic chip, dual-camera system, and all-day battery life. Great value option.",
    price: 699.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 324,
    stock: 25,
    category: "electronics"
  },
  {
    id: "1006",
    name: "Xiaomi 14 Ultra",
    description: "Photography-focused flagship with Leica cameras, Snapdragon 8 Gen 3, and premium design.",
    price: 999.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 76,
    stock: 18,
    category: "electronics"
  },
  {
    id: "1007",
    name: "Nothing Phone (2)",
    description: "Unique transparent design with Glyph interface, flagship performance, and clean Android experience.",
    price: 599.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.3,
    reviews: 145,
    stock: 14,
    category: "electronics"
  },
  {
    id: "1008",
    name: "Samsung Galaxy A54",
    description: "Mid-range smartphone with excellent camera, 5000mAh battery, and premium design at affordable price.",
    price: 449.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.2,
    reviews: 203,
    stock: 30,
    category: "electronics"
  },
  // Other existing products
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

      let productsData: Product[] = []
      let orders: Order[] = []
      let stats = this.state.stats

      if (productsResponse?.ok) {
        productsData = await productsResponse.json()
      } else {
        productsData = products
      }

      if (ordersResponse?.ok) {
        orders = await ordersResponse.json()
      }

      if (statsResponse?.ok) {
        stats = await statsResponse.json()
      }

      // Update state
      this.state = {
        products: productsData,
        orders,
        stats
      }

      console.log('Store synced - Products:', productsData.length, 'Orders:', orders.length)

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

  async getProducts(): Promise<Product[]> {
    return products
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return products.find(p => p.id === id)
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return products.filter(p => p.category === category)
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
    )
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

  async updateProduct(productId: string, updates: Partial<Omit<Product, 'id'>>): Promise<void> {
    try {
      console.log('Updating product:', productId, updates)

      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      // Immediately sync to update local state
      await this.syncWithServer()

      // Show notification
      this.showNotification('Product updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update product:', error)
      this.showNotification('Failed to update product', 'error')
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

  // Categories management
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Return default categories on error
      return [
        { id: 'electronics', name: 'Electronics', description: 'Latest gadgets and tech' },
        { id: 'fashion', name: 'Fashion', description: 'Clothing and accessories' },
        { id: 'home-living', name: 'Home & Living', description: 'Home decor and essentials' },
        { id: 'beauty', name: 'Beauty', description: 'Beauty and personal care' }
      ]
    }
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      console.log('Adding new category:', category.name)

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      })

      if (!response.ok) {
        throw new Error('Failed to add category')
      }

      const newCategory = await response.json()

      // Show notification
      this.showNotification(`Category added: ${newCategory.name}`, 'success')

      return newCategory
    } catch (error) {
      console.error('Failed to add category:', error)
      this.showNotification('Failed to add category', 'error')
      throw error
    }
  }

  async addSubcategory(categoryId: string, subcategory: Omit<Category, 'id'>): Promise<void> {
    try {
      console.log('Adding subcategory to:', categoryId, subcategory.name)

      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, subcategory }),
      })

      if (!response.ok) {
        throw new Error('Failed to add subcategory')
      }

      // Show notification
      this.showNotification(`Subcategory added: ${subcategory.name}`, 'success')
    } catch (error) {
      console.error('Failed to add subcategory:', error)
      this.showNotification('Failed to add subcategory', 'error')
      throw error
    }
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
export type { Product, Order, StoreState, StoreListener, Category }