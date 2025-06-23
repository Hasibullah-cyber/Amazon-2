
// Global store for orders and inventory management
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: string
  createdAt: string
  estimatedDelivery: string
}

class StoreManager {
  private orders: Order[] = []
  private products: Product[] = [
    {
      id: "101",
      name: "Premium Wireless Headphones",
      price: 220,
      stock: 15,
      category: "electronics",
      image: "/placeholder.svg?height=400&width=400",
      description: "High-quality wireless headphones with noise cancellation"
    },
    {
      id: "102", 
      name: "Smart Fitness Watch",
      price: 165,
      stock: 8,
      category: "electronics",
      image: "/placeholder.svg?height=400&width=400",
      description: "Advanced fitness tracking with heart rate monitor"
    },
    {
      id: "201",
      name: "Designer Sunglasses",
      price: 88,
      stock: 23,
      category: "fashion",
      image: "/placeholder.svg?height=400&width=400",
      description: "Stylish sunglasses with UV protection"
    },
    {
      id: "301",
      name: "Scented Candle Set",
      price: 35,
      stock: 42,
      category: "home-living",
      image: "/placeholder.svg?height=400&width=400",
      description: "Set of 3 premium scented candles"
    }
  ]
  private listeners: Array<() => void> = []

  // Orders management
  addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    this.orders.unshift(newOrder)
    
    // Update inventory
    order.items.forEach(item => {
      this.updateProductStock(item.id, -item.quantity)
    })
    
    this.notifyListeners()
    return newOrder
  }

  getOrders(): Order[] {
    return [...this.orders]
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    const orderIndex = this.orders.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = status
      this.notifyListeners()
    }
  }

  // Products management
  getProducts(): Product[] {
    return [...this.products]
  }

  getProduct(id: string): Product | undefined {
    return this.products.find(product => product.id === id)
  }

  updateProductStock(productId: string, quantity: number) {
    const productIndex = this.products.findIndex(product => product.id === productId)
    if (productIndex !== -1) {
      this.products[productIndex].stock += quantity
      if (this.products[productIndex].stock < 0) {
        this.products[productIndex].stock = 0
      }
      this.notifyListeners()
    }
  }

  updateProduct(productId: string, updates: Partial<Product>) {
    const productIndex = this.products.findIndex(product => product.id === productId)
    if (productIndex !== -1) {
      this.products[productIndex] = { ...this.products[productIndex], ...updates }
      this.notifyListeners()
    }
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    }
    this.products.push(newProduct)
    this.notifyListeners()
    return newProduct
  }

  // Statistics
  getStats() {
    const totalOrders = this.orders.length
    const totalRevenue = this.orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const pendingOrders = this.orders.filter(order => order.status === 'pending').length
    const lowStockProducts = this.products.filter(product => product.stock < 10).length

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentOrders: this.orders.slice(0, 5)
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
