export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  reviews: number
  stock: number
  category: string
}

interface Category {
  id: string
  name: string
  description: string
}

export interface Order {
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

// Extended product database including mobile phones and other categories
const products: Product[] = [
  // Electronics - Mobile Phones
  {
    id: "1001",
    name: "iPhone 15 Pro Max",
    description: "Latest Apple smartphone with advanced camera system, titanium design, and A17 Pro chip. Features 6.7-inch Super Retina XDR display with ProMotion technology, 48MP main camera with 5x telephoto zoom, and all-day battery life.",
    price: 1299.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 245,
    stock: 15,
    category: "electronics"
  },
  {
    id: "1002",
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android phone with S Pen, 200MP camera, and AI features. Built-in S Pen for productivity and creativity. Features 6.8-inch Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, and advanced night photography.",
    price: 1199.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 189,
    stock: 22,
    category: "electronics"
  },
  {
    id: "1003",
    name: "Google Pixel 8 Pro",
    description: "AI-powered photography smartphone with Magic Eraser, Night Sight, and computational photography features. Features Google's Tensor G3 chip, 6.7-inch LTPO OLED display, and 7 years of security updates.",
    price: 899.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 156,
    stock: 8,
    category: "electronics"
  },
  {
    id: "1004",
    name: "OnePlus 12",
    description: "Flagship OnePlus smartphone with Snapdragon 8 Gen 3, fast charging, and OxygenOS. Features 6.82-inch LTPO AMOLED display, 50MP triple camera system, and 100W SuperVOOC charging.",
    price: 799.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 134,
    stock: 18,
    category: "electronics"
  },
  {
    id: "1005",
    name: "MacBook Air M3",
    description: "Lightweight laptop with Apple M3 chip, up to 18 hours of battery life, and stunning Liquid Retina display. Perfect for work, study, and creative projects.",
    price: 1299.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 278,
    stock: 12,
    category: "electronics"
  },
  {
    id: "1006",
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery life, and multipoint connection for seamless device switching.",
    price: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 456,
    stock: 35,
    category: "electronics"
  },
  {
    id: "1007",
    name: "iPad Pro 12.9",
    description: "Most advanced iPad with M2 chip, stunning Liquid Retina XDR display, and support for Apple Pencil and Magic Keyboard. Perfect for professional creative work.",
    price: 1099.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 189,
    stock: 20,
    category: "electronics"
  },
  {
    id: "1008",
    name: "AirPods Pro 2nd Gen",
    description: "Active noise cancellation, Transparency mode, spatial audio, and up to 6 hours of listening time. Includes MagSafe charging case.",
    price: 249.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 567,
    stock: 45,
    category: "electronics"
  },

  // Fashion Items
  {
    id: "2001",
    name: "Nike Air Max 270",
    description: "Modern lifestyle sneakers with visible Air Max unit in the heel, breathable mesh upper, and all-day comfort for casual wear and light activities.",
    price: 149.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 234,
    stock: 28,
    category: "fashion"
  },
  {
    id: "2002",
    name: "Levi's 501 Original Jeans",
    description: "Classic straight-leg jeans with button fly, made from premium denim. Timeless style that never goes out of fashion, available in multiple washes.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 345,
    stock: 56,
    category: "fashion"
  },
  {
    id: "2003",
    name: "Zara Oversized Blazer",
    description: "Contemporary oversized blazer in premium fabric blend. Perfect for office wear or casual styling, featuring notched lapels and functional pockets.",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 123,
    stock: 32,
    category: "fashion"
  },
  {
    id: "2004",
    name: "Adidas Ultraboost 22",
    description: "High-performance running shoes with responsive Boost midsole, Primeknit upper, and Continental rubber outsole for superior grip and energy return.",
    price: 189.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 456,
    stock: 22,
    category: "fashion"
  },
  {
    id: "2005",
    name: "H&M Cotton T-Shirt",
    description: "Soft organic cotton t-shirt in classic fit. Comfortable everyday wear with ribbed crew neck and short sleeves. Available in multiple colors.",
    price: 12.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 789,
    stock: 120,
    category: "fashion"
  },
  {
    id: "2006",
    name: "Ray-Ban Aviator Classic",
    description: "Iconic aviator sunglasses with metal frame, crystal lenses, and 100% UV protection. Timeless style that complements any look.",
    price: 154.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 567,
    stock: 43,
    category: "fashion"
  },

  // Beauty Products
  {
    id: "3001",
    name: "Nivea Daily Moisturizer SPF 30",
    description: "Lightweight daily moisturizer with broad-spectrum SPF 30 protection. Hydrates skin while protecting from harmful UV rays. Suitable for all skin types.",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 234,
    stock: 78,
    category: "beauty"
  },
  {
    id: "3002",
    name: "Maybelline Lipstick Set",
    description: "Collection of 5 popular lipstick shades in matte and creamy finishes. Long-lasting formula with rich, vibrant colors for every occasion.",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 456,
    stock: 65,
    category: "beauty"
  },
  {
    id: "3003",
    name: "L'Oreal Foundation",
    description: "Full coverage liquid foundation with 24-hour wear. Buildable formula that provides natural-looking coverage while feeling lightweight on skin.",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 345,
    stock: 89,
    category: "beauty"
  },
  {
    id: "3004",
    name: "Garnier Micellar Water",
    description: "Gentle makeup remover and cleanser in one. Removes waterproof makeup and impurities without harsh rubbing. Suitable for sensitive skin.",
    price: 8.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 567,
    stock: 156,
    category: "beauty"
  },
  {
    id: "3005",
    name: "Olay Regenerist Serum",
    description: "Anti-aging serum with amino-peptides and micro-sculpting technology. Helps smooth skin texture and reduce appearance of fine lines.",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 234,
    stock: 67,
    category: "beauty"
  },

  // Home & Living
  {
    id: "4001",
    name: "IKEA Table Lamp",
    description: "Modern LED table lamp with adjustable brightness and warm white light. Perfect for reading, working, or ambient lighting in any room.",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 123,
    stock: 45,
    category: "home-living"
  },
  {
    id: "4002",
    name: "Throw Pillow Set",
    description: "Set of 2 decorative throw pillows with removable covers. Soft polyester filling with cotton blend covers in neutral colors.",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 89,
    stock: 78,
    category: "home-living"
  },
  {
    id: "4003",
    name: "Scented Candle Collection",
    description: "Set of 3 premium scented candles with natural soy wax. Features vanilla, lavender, and eucalyptus scents for relaxation and ambiance.",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 156,
    stock: 56,
    category: "home-living"
  },
  {
    id: "4004",
    name: "Cotton Bed Sheets Set",
    description: "Premium 100% cotton bed sheet set including fitted sheet, flat sheet, and pillowcases. Soft, breathable, and machine washable.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 234,
    stock: 34,
    category: "home-living"
  },
  {
    id: "4005",
    name: "Wall Clock",
    description: "Modern minimalist wall clock with silent quartz movement. Clean design with easy-to-read numbers, perfect for any room decor.",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 67,
    stock: 23,
    category: "home-living"
  }
]

const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Latest technology and gadgets"
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Clothing, shoes, and accessories"
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Skincare, makeup, and personal care"
  },
  {
    id: "home-living",
    name: "Home & Living",
    description: "Furniture, decor, and household items"
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    description: "Fitness equipment and outdoor gear"
  },
  {
    id: "books",
    name: "Books",
    description: "Fiction, non-fiction, and educational books"
  }
]

// Store manager implementation
class StoreManager {
  private products: Product[] = products
  private categories: Category[] = categories
  private orders: Order[] = []
  private subscribers: ((state: { products: Product[], categories: Category[], orders: Order[] }) => void)[] = []

  // Subscribe to store changes
  subscribe(callback: (state: { products: Product[], categories: Category[], orders: Order[] }) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  private notifySubscribers() {
    const state = { products: this.products, categories: this.categories, orders: this.orders }
    this.subscribers.forEach(callback => callback(state))
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return this.products
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: (Date.now() + Math.random()).toString()
    }
    this.products.push(newProduct)
    this.notifySubscribers()
    return newProduct
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const productIndex = this.products.findIndex(p => p.id === productId)
    if (productIndex !== -1) {
      this.products[productIndex] = { ...this.products[productIndex], ...updates }
      this.notifySubscribers()
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase()
    return this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    )
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(p => p.category === category)
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return this.categories
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, '-')
    }
    this.categories.push(newCategory)
    this.notifySubscribers()
    return newCategory
  }

  async addSubcategory(categoryId: string, subcategory: { name: string; description: string }): Promise<void> {
    // This is a placeholder for subcategory functionality
    // In a real implementation, you might want to have a separate subcategories array
    console.log(`Adding subcategory ${subcategory.name} to category ${categoryId}`)
    this.notifySubscribers()
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    try {
      // First try to get from API (database)
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const orders = await response.json()
        this.orders = orders
        this.notifySubscribers()
        console.log('Fetched orders from database:', orders.length)
        return orders
      }
    } catch (error) {
      console.error('Error fetching orders from API:', error)
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('orders')
      if (stored) {
        const orders = JSON.parse(stored)
        this.orders = orders
        console.log('Using fallback orders from localStorage:', orders.length)
        return orders
      }
    }

    console.log('No orders found in database or localStorage')
    return []
  }

  async getUserOrders(email: string): Promise<Order[]> {
    try {
      const response = await fetch(`/api/user-orders?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching user orders:', error)
    }
    return []
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const response = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      })

      if (response.ok) {
        // Update local order status
        const orderIndex = this.orders.findIndex(order => order.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = status
          this.notifySubscribers()
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  async addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: (Date.now() + Math.random()).toString(),
      createdAt: new Date().toISOString()
    }
    this.orders.push(newOrder)
    this.notifySubscribers()
    return newOrder
  }

  async refresh(): Promise<void> {
    await this.getOrders()
    await this.getProducts()
    await this.getCategories()
  }

  // Method to force sync with database
  async syncWithDatabase(): Promise<void> {
    await this.refresh()
  }
}

export const storeManager = new StoreManager()