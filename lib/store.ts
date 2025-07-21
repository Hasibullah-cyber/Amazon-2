export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  reviews: number
  stock: number
  category: string
  rating?: number
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

const products: Product[] = [
  {
    id: "1001",
    name: "iPhone 15 Pro Max",
    description: "Latest Apple smartphone with advanced camera system, titanium design, and A17 Pro chip.",
    price: 1299.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 245,
    stock: 15,
    category: "electronics",
    rating: 4.8
  },
  {
    id: "1002",
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android phone with S Pen, 200MP camera, and AI features.",
    price: 1199.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 189,
    stock: 22,
    category: "electronics",
    rating: 4.7
  },
  {
    id: "1003",
    name: "Google Pixel 8 Pro",
    description: "AI-powered photography smartphone with Magic Eraser and Night Sight.",
    price: 899.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 156,
    stock: 8,
    category: "electronics",
    rating: 4.6
  },
  {
    id: "1004",
    name: "OnePlus 12",
    description: "Flagship killer with Snapdragon 8 Gen 3 and 120Hz display.",
    price: 799.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 134,
    stock: 18,
    category: "electronics",
    rating: 4.5
  },
  {
    id: "1005",
    name: "MacBook Air M3",
    description: "Lightweight laptop with Apple M3 chip and all-day battery life.",
    price: 1299.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 278,
    stock: 12,
    category: "electronics",
    rating: 4.8
  },
  {
    id: "1006",
    name: "Sony WH-1000XM5",
    description: "Noise canceling headphones with 30-hour battery life.",
    price: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 456,
    stock: 35,
    category: "electronics",
    rating: 4.7
  },
  {
    id: "1007",
    name: "iPad Pro 12.9",
    description: "Most advanced iPad with M2 chip and Liquid Retina XDR display.",
    price: 1099.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 189,
    stock: 20,
    category: "electronics",
    rating: 4.6
  },
  {
    id: "1008",
    name: "AirPods Pro 2nd Gen",
    description: "Active noise cancellation with spatial audio.",
    price: 249.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 567,
    stock: 45,
    category: "electronics",
    rating: 4.5
  },
  {
    id: "2001",
    name: "Nike Air Max 270",
    description: "Modern lifestyle sneakers with visible Air Max unit.",
    price: 149.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 234,
    stock: 28,
    category: "fashion",
    rating: 4.4
  },
  {
    id: "2002",
    name: "Levi's 501 Original Jeans",
    description: "Classic straight-leg jeans with button fly.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 345,
    stock: 56,
    category: "fashion",
    rating: 4.6
  },
  {
    id: "2003",
    name: "Zara Oversized Blazer",
    description: "Contemporary oversized blazer in premium fabric.",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 123,
    stock: 32,
    category: "fashion",
    rating: 4.2
  },
  {
    id: "2004",
    name: "Adidas Ultraboost 22",
    description: "High-performance running shoes with Boost midsole.",
    price: 189.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 456,
    stock: 22,
    category: "fashion",
    rating: 4.7
  },
  {
    id: "2005",
    name: "H&M Cotton T-Shirt",
    description: "Soft organic cotton t-shirt in classic fit.",
    price: 12.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 789,
    stock: 120,
    category: "fashion",
    rating: 4.1
  },
  {
    id: "2006",
    name: "Ray-Ban Aviator Classic",
    description: "Iconic aviator sunglasses with 100% UV protection.",
    price: 154.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 567,
    stock: 43,
    category: "fashion",
    rating: 4.5
  },
  {
    id: "3001",
    name: "Fair and Lovely Advanced Multi-Vitamin Cream",
    description: "Advanced fairness cream with multi-vitamins.",
    price: 18.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 456,
    stock: 120,
    category: "beauty",
    rating: 4.4
  },
  {
    id: "3001b",
    name: "Fair & Lovely Natural Glow Cream",
    description: "Natural fairness cream with turmeric and lemon.",
    price: 16.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 334,
    stock: 89,
    category: "beauty",
    rating: 4.2
  },
  {
    id: "3001c",
    name: "Nivea Daily Moisturizer SPF 30",
    description: "Lightweight daily moisturizer with SPF 30.",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 234,
    stock: 78,
    category: "beauty",
    rating: 4.3
  },
  {
    id: "3002",
    name: "Maybelline Lipstick Set",
    description: "Collection of 5 popular lipstick shades.",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 456,
    stock: 65,
    category: "beauty",
    rating: 4.4
  },
  {
    id: "3003",
    name: "L'Oreal Foundation",
    description: "Full coverage liquid foundation with 24-hour wear.",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 345,
    stock: 89,
    category: "beauty",
    rating: 4.2
  },
  {
    id: "3004",
    name: "Garnier Micellar Water",
    description: "Gentle makeup remover and cleanser.",
    price: 8.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 567,
    stock: 156,
    category: "beauty",
    rating: 4.5
  },
  {
    id: "3005",
    name: "Olay Regenerist Serum",
    description: "Anti-aging serum with amino-peptides.",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 234,
    stock: 67,
    category: "beauty",
    rating: 4.6
  },
  {
    id: "4001",
    name: "IKEA Table Lamp",
    description: "Modern LED table lamp with adjustable brightness.",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 123,
    stock: 45,
    category: "home-living",
    rating: 4.3
  },
  {
    id: "4002",
    name: "Throw Pillow Set",
    description: "Set of 2 decorative throw pillows.",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 89,
    stock: 78,
    category: "home-living",
    rating: 4.1
  },
  {
    id: "4003",
    name: "Scented Candle Collection",
    description: "Set of 3 premium scented candles.",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 156,
    stock: 56,
    category: "home-living",
    rating: 4.7
  },
  {
    id: "4004",
    name: "Cotton Bed Sheets Set",
    description: "Premium 100% cotton bed sheet set.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 234,
    stock: 34,
    category: "home-living",
    rating: 4.4
  },
  {
    id: "4005",
    name: "Wall Clock",
    description: "Modern minimalist wall clock.",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 67,
    stock: 23,
    category: "home-living"
  },
  {
    id: "1025",
    name: "OnePlus 12",
    description: "Flagship killer with Snapdragon 8 Gen 3.",
    price: 799.99,
    image: "/placeholder.svg?height=300&width=300",
    reviews: 134,
    stock: 18,
    category: "electronics",
    rating: 4.5
  }
];

const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Latest technology and gadgets"
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Clothing, shoes and accessories"
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Skincare, makeup and personal care"
  },
  {
    id: "home-living",
    name: "Home & Living",
    description: "Furniture and household items"
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    description: "Fitness equipment and outdoor gear"
  },
  {
    id: "books",
    name: "Books",
    description: "Fiction and educational books"
  }
];

class StoreManager {
  private products: Product[] = products;
  private categories: Category[] = categories;
  private orders: Order[] = [];
  private subscribers: ((state: { products: Product[], categories: Category[], orders: Order[] }) => void)[] = [];

  private getApiUrl(path: string): string {
    const baseUrl = typeof window === 'undefined' 
      ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      : window.location.origin;
    return `${baseUrl}${path}`;
  }

  subscribe(callback: (state: { products: Product[], categories: Category[], orders: Order[] }) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    const state = { products: this.products, categories: this.categories, orders: this.orders };
    this.subscribers.forEach(callback => callback(state));
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(this.getApiUrl('/api/admin/products'), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);
      const data = await response.json();
      if (data.products && Array.isArray(data.products)) {
        this.products = data.products;
      }
      this.notifySubscribers();
      return this.products;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      return this.products;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    // Local lookup, no API call
    return this.products.find(p => p.id === id) || null;
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: (Date.now() + Math.random()).toString()
    };
    this.products.push(newProduct);
    this.notifySubscribers();
    return newProduct;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      const bodyPayload = {
        id: productId,
        updates: {
          ...updates,
          ...(typeof updates.category === 'string' ? { category: { id: updates.category } } : {})
        }
      };

      const response = await fetch(this.getApiUrl('/api/admin/products'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      // Reload products after update
      await this.getProducts();
      this.notifySubscribers();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return this.products.filter(product => (
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    ));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(p => p.category === category);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return this.categories;
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, '-')
    };
    this.categories.push(newCategory);
    this.notifySubscribers();
    return newCategory;
  }

  async addSubcategory(categoryId: string, subcategory: { name: string; description: string }): Promise<void> {
    console.log(`Adding subcategory ${subcategory.name} to category ${categoryId}`);
    this.notifySubscribers();
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch(this.getApiUrl('/api/admin/orders'), {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const orders = await response.json();
      this.orders = Array.isArray(orders) ? orders : [];
      this.notifySubscribers();
      return this.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('orders');
          if (stored) {
            this.orders = JSON.parse(stored);
            return this.orders;
          }
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError);
        }
      }

      return [];
    }
  }

  async getUserOrders(email: string): Promise<Order[]> {
    try {
      const response = await fetch(this.getApiUrl(`/api/user-orders?email=${encodeURIComponent(email)}`), {
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) return false;

      const orderIndex = this.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        this.orders[orderIndex].status = status;
        this.notifySubscribers();
      }
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  async addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order | null> {
    try {
      const newOrder:
