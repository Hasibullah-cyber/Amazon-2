export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  rating: number
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
    rating: 4.8,
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
    rating: 4.7,
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
    rating: 4.6,
    reviews: 156,
    stock: 8,
    category: "electronics"
  },
  {
    id: "1004",
    name: "OnePlus 12",
    description: "Flagship killer with Snapdragon 8 Gen 3, 120Hz display, and 100W fast charging. Premium build quality at competitive price. Features 6.82-inch Fluid AMOLED display, 50MP triple camera system, and OxygenOS 14.",
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
    description: "Previous generation iPhone with A15 Bionic chip, dual-camera system, and all-day battery life. Great value option with 6.1-inch Super Retina XDR display, improved main and ultra-wide cameras, and Crash Detection.",
    price: 699.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 324,
    stock: 25,
    category: "electronics"
  },

  // Electronics - Headphones
  {
    id: "1006",
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling headphones with 30-hour battery life. Features V1 processor for exceptional sound quality, speak-to-chat technology, and premium comfort for long listening sessions.",
    price: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 312,
    stock: 18,
    category: "electronics"
  },
  {
    id: "1007",
    name: "Bose QuietComfort 45",
    description: "Comfortable noise canceling headphones with TriPort acoustic architecture. Features 24-hour battery life, lightweight design, and acclaimed Bose noise cancellation technology.",
    price: 329.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 278,
    stock: 14,
    category: "electronics"
  },
  {
    id: "1008",
    name: "Apple AirPods Pro 2",
    description: "Next-generation AirPods with adaptive transparency, personalized spatial audio, and up to 2x more active noise cancellation. Features H2 chip and precision finding.",
    price: 249.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 445,
    stock: 30,
    category: "electronics"
  },

  // Electronics - Laptops
  {
    id: "1009",
    name: "MacBook Pro 14-inch M3",
    description: "Professional laptop with M3 chip, 14-inch Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for creative professionals with 8-core CPU, 10-core GPU, and advanced thermal design.",
    price: 1599.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 156,
    stock: 8,
    category: "electronics"
  },
  {
    id: "1010",
    name: "Dell XPS 13",
    description: "Ultra-portable laptop with 13th Gen Intel Core processor, 13.4-inch InfinityEdge display, and premium aluminum construction. Ideal for productivity and travel.",
    price: 999.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 203,
    stock: 12,
    category: "electronics"
  },
  {
    id: "1011",
    name: "Lenovo ThinkPad X1 Carbon",
    description: "Business laptop with military-grade durability, 14-inch 2.8K OLED display, and exceptional keyboard. Features Intel Core i7, 16GB RAM, and all-day battery life.",
    price: 1399.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 178,
    stock: 6,
    category: "electronics"
  },

  // Fashion - Clothing
  {
    id: "2001",
    name: "Premium Cotton T-Shirt",
    description: "Soft, breathable cotton t-shirt with classic fit. Made from 100% organic cotton with reinforced seams. Available in multiple colors and sizes. Perfect for casual wear and layering.",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.3,
    reviews: 892,
    stock: 150,
    category: "fashion"
  },
  {
    id: "2002",
    name: "Slim Fit Denim Jeans",
    description: "Classic blue denim jeans with modern slim fit. Made from premium stretch denim for comfort and durability. Features five-pocket styling and button fly closure.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 567,
    stock: 85,
    category: "fashion"
  },
  {
    id: "2003",
    name: "Wool Blend Sweater",
    description: "Cozy wool blend sweater with ribbed cuffs and hem. Perfect for cold weather with soft texture and classic crew neck design. Machine washable and wrinkle-resistant.",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 234,
    stock: 45,
    category: "fashion"
  },

  // Fashion - Shoes
  {
    id: "2004",
    name: "Running Sneakers",
    description: "Lightweight running shoes with responsive cushioning and breathable mesh upper. Features advanced sole technology for comfort during long runs and everyday wear.",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 778,
    stock: 65,
    category: "fashion"
  },
  {
    id: "2005",
    name: "Leather Dress Shoes",
    description: "Classic leather oxford shoes perfect for formal occasions. Handcrafted from genuine leather with leather sole and traditional construction. Available in black and brown.",
    price: 199.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 345,
    stock: 28,
    category: "fashion"
  },
  {
    id: "2006",
    name: "Casual Canvas Sneakers",
    description: "Versatile canvas sneakers with rubber sole and classic design. Perfect for everyday wear with comfortable fit and durable construction. Available in multiple colors.",
    price: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.2,
    reviews: 456,
    stock: 92,
    category: "fashion"
  },

  // Fashion - Accessories
  {
    id: "2007",
    name: "Leather Wallet",
    description: "Premium genuine leather wallet with RFID blocking technology. Features multiple card slots, bill compartment, and ID window. Slim design fits comfortably in pocket.",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 623,
    stock: 74,
    category: "fashion"
  },
  {
    id: "2008",
    name: "Designer Sunglasses",
    description: "UV protection sunglasses with polarized lenses and lightweight frame. Features anti-glare coating and scratch-resistant lenses. Includes protective case and cleaning cloth.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.0,
    reviews: 285,
    stock: 38,
    category: "fashion"
  },

  // Beauty - Skincare
  {
    id: "3001",
    name: "Anti-Aging Face Cream",
    description: "Advanced anti-aging cream with retinol and hyaluronic acid. Reduces fine lines and wrinkles while providing deep hydration. Suitable for all skin types with SPF 30 protection.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 1234,
    stock: 89,
    category: "beauty"
  },
  {
    id: "3002",
    name: "Vitamin C Serum",
    description: "Brightening vitamin C serum with 20% L-ascorbic acid. Evens skin tone, reduces dark spots, and provides antioxidant protection. Lightweight formula absorbs quickly.",
    price: 45.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 892,
    stock: 67,
    category: "beauty"
  },
  {
    id: "3003",
    name: "Gentle Cleansing Foam",
    description: "Mild foam cleanser for sensitive skin with botanical extracts. Removes makeup and impurities without stripping natural oils. pH-balanced and fragrance-free formula.",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 567,
    stock: 156,
    category: "beauty"
  },

  // Beauty - Makeup
  {
    id: "3004",
    name: "Long-Lasting Foundation",
    description: "Full coverage foundation with 24-hour wear. Available in 40 shades with buildable coverage and natural finish. Contains SPF 25 and is suitable for all skin types.",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 678,
    stock: 94,
    category: "beauty"
  },
  {
    id: "3005",
    name: "Waterproof Mascara",
    description: "Volumizing waterproof mascara that lengthens and defines lashes. Smudge-proof formula lasts all day without flaking. Includes vitamin E for lash conditioning.",
    price: 18.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.3,
    reviews: 445,
    stock: 128,
    category: "beauty"
  },
  {
    id: "3006",
    name: "Matte Lipstick Set",
    description: "Collection of 6 matte lipsticks in trending colors. Long-wearing formula with comfortable feel and full coverage. Includes popular reds, pinks, and nude shades.",
    price: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 789,
    stock: 45,
    category: "beauty"
  },

  // Home & Living - Furniture
  {
    id: "4001",
    name: "Modern Dining Table",
    description: "Contemporary dining table made from sustainable wood with sleek metal legs. Seats 6 people comfortably. Features scratch-resistant surface and easy assembly.",
    price: 599.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 234,
    stock: 12,
    category: "home-living"
  },
  {
    id: "4002",
    name: "Ergonomic Office Chair",
    description: "Comfortable office chair with lumbar support and adjustable height. Features breathable mesh back, padded seat, and 360-degree swivel. Perfect for long work sessions.",
    price: 299.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 456,
    stock: 28,
    category: "home-living"
  },
  {
    id: "4003",
    name: "Storage Ottoman",
    description: "Multi-functional storage ottoman with hidden compartment. Serves as extra seating, footrest, and storage solution. Available in multiple fabric colors and easy to clean.",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.3,
    reviews: 178,
    stock: 34,
    category: "home-living"
  },

  // Home & Living - Decor
  {
    id: "4004",
    name: "Scented Candle Set",
    description: "Set of 3 premium scented candles in glass jars with 40+ hour burn time each. Features lavender, vanilla, and eucalyptus scents. Made from natural soy wax.",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 623,
    stock: 89,
    category: "home-living"
  },
  {
    id: "4005",
    name: "Wall Art Canvas Set",
    description: "Set of 3 modern abstract canvas prints ready to hang. High-quality prints on canvas with wooden frames. Adds contemporary style to any room.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 234,
    stock: 45,
    category: "home-living"
  },
  {
    id: "4006",
    name: "Throw Pillow Collection",
    description: "Set of 4 decorative throw pillows with removable covers. Made from soft cotton blend in complementary colors. Perfect for sofas, beds, and chairs.",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.2,
    reviews: 345,
    stock: 67,
    category: "home-living"
  },

  // Home & Living - Kitchen
  {
    id: "4007",
    name: "Non-Stick Cookware Set",
    description: "Complete 10-piece non-stick cookware set with pots, pans, and lids. Features ceramic non-stick coating, heat-resistant handles, and dishwasher-safe construction.",
    price: 199.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 567,
    stock: 23,
    category: "home-living"
  },
  {
    id: "4008",
    name: "Coffee Maker",
    description: "Programmable drip coffee maker with 12-cup capacity and thermal carafe. Features auto-brew timer, pause-and-serve function, and permanent filter. Perfect for coffee lovers.",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 378,
    stock: 18,
    category: "home-living"
  },

  // Sports - Fitness Equipment
  {
    id: "5001",
    name: "Adjustable Dumbbells",
    description: "Space-saving adjustable dumbbells with weight range from 5-50 lbs per dumbbell. Quick-change system and comfortable grip handles. Perfect for home gym workouts.",
    price: 299.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 445,
    stock: 15,
    category: "sports"
  },
  {
    id: "5002",
    name: "Yoga Mat Premium",
    description: "Extra-thick yoga mat with superior grip and cushioning. Made from eco-friendly TPE material with alignment lines. Includes carrying strap and is easy to clean.",
    price: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 678,
    stock: 89,
    category: "sports"
  },
  {
    id: "5003",
    name: "Resistance Bands Set",
    description: "Complete resistance bands set with 5 different resistance levels, door anchor, handles, and ankle straps. Perfect for strength training and physical therapy.",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.3,
    reviews: 234,
    stock: 156,
    category: "sports"
  },

  // Sports - Outdoor Gear
  {
    id: "5004",
    name: "Hiking Backpack",
    description: "Durable 40L hiking backpack with multiple compartments, hydration system compatibility, and rain cover. Features padded shoulder straps and adjustable fit.",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 345,
    stock: 34,
    category: "sports"
  },
  {
    id: "5005",
    name: "Camping Tent",
    description: "4-person waterproof camping tent with easy setup and spacious interior. Features color-coded poles, vestibule area, and UV-resistant materials.",
    price: 199.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 178,
    stock: 12,
    category: "sports"
  },

  // Books - Fiction
  {
    id: "6001",
    name: "The Midnight Library",
    description: "Bestselling novel about infinite possibilities and second chances. A thought-provoking story about life, regret, and the endless possibilities that exist in each moment.",
    price: 16.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 1234,
    stock: 78,
    category: "books"
  },
  {
    id: "6002",
    name: "Where the Crawdads Sing",
    description: "Coming-of-age mystery novel set in the marshlands of North Carolina. A beautiful story of nature, isolation, and the resilience of the human spirit.",
    price: 15.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 2345,
    stock: 92,
    category: "books"
  },

  // Books - Non-Fiction
  {
    id: "6003",
    name: "Atomic Habits",
    description: "Practical guide to building good habits and breaking bad ones. Learn how tiny changes can lead to remarkable results with evidence-based strategies.",
    price: 18.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 3456,
    stock: 145,
    category: "books"
  },
  {
    id: "6004",
    name: "Sapiens: A Brief History",
    description: "Fascinating exploration of human history from the Stone Age to the present. Examines how humans have shaped the world and what the future might hold.",
    price: 19.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 1567,
    stock: 67,
    category: "books"
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