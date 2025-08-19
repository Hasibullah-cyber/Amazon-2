export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  reviews: number;
  stock: number;
  category: string | { id: string; name: string };
  rating?: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  vat: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery: string;
}

class StoreManager {
  private products: Product[] = [];
  private categories: Category[] = [];
  private orders: Order[] = [];

  private subscribers: ((state: { products: Product[]; categories: Category[]; orders: Order[] }) => void)[] = [];

  private getApiUrl(path: string): string {
    const baseUrl =
      typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        : window.location.origin;
    return `${baseUrl}${path}`;
  }

  subscribe(callback: (state: { products: Product[]; categories: Category[]; orders: Order[] }) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notifySubscribers() {
    const state = { products: this.products, categories: this.categories, orders: this.orders };
    this.subscribers.forEach((callback) => callback(state));
  }

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(this.getApiUrl('/api/admin/products'), { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.error || `Failed to fetch products: ${res.statusText}`);
      }
      const data = await res.json();
      this.products = data.products ?? [];
      this.notifySubscribers();
      return this.products;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      return this.products;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) || null;
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: (Date.now() + Math.random()).toString(),
    };
    this.products.push(newProduct);
    this.notifySubscribers();
    return newProduct;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      // Handle category conversion
      const updateData: any = { ...updates };
      
      if (updates.category !== undefined) {
        if (typeof updates.category === 'string') {
          updateData.categoryId = updates.category;
        } else if (updates.category && typeof updates.category === 'object') {
          updateData.categoryId = updates.category.id;
        }
        // Remove the category field as we're using categoryId
        delete updateData.category;
      }

      const res = await fetch(this.getApiUrl(`/api/admin/products/${productId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.error || `Failed to update product: ${res.statusText}`);
      }
      
      await this.getProducts();
      this.notifySubscribers();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        (typeof product.category === 'string'
          ? product.category.toLowerCase().includes(searchTerm)
          : product.category.name.toLowerCase().includes(searchTerm))
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter((p) => {
      if (typeof p.category === 'string') return p.category === category;
      return p.category?.id === category;
    });
  }

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(this.getApiUrl('/api/categories'), {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.error || `Failed to fetch categories: ${res.statusText}`);
      }
      const data = await res.json();
      this.categories = data ?? [];
      this.notifySubscribers();
      return this.categories;
    } catch (err) {
      console.error('Error fetching categories:', err);
      return this.categories;
    }
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, '-'),
    };
    this.categories.push(newCategory);
    this.notifySubscribers();
    return newCategory;
  }

  async addSubcategory(categoryId: string, subcategory: { name: string; description: string }): Promise<void> {
    console.log(`Adding subcategory ${subcategory.name} to category ${categoryId}`);
    this.notifySubscribers();
  }

  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(this.getApiUrl('/api/admin/orders'), {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.error || `Failed to fetch orders: ${res.statusText}`);
      }
      const orders = await res.json();
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
      const res = await fetch(this.getApiUrl(`/api/user-orders?email=${encodeURIComponent(email)}`), {
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.error || `Failed to fetch user orders: ${res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const res = await fetch(this.getApiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        console.error('Order status update failed:', errorData);
        return false;
      }

      const index = this.orders.findIndex((o) => o.id === orderId);
      if (index !== -1) {
        this.orders[index].status = status;
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
      const newOrder: Order = {
        ...order,
        id: (Date.now() + Math.random()).toString(),
        createdAt: new Date().toISOString(),
      };

      const res = await fetch(this.getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.error || `Failed to add order: ${res.statusText}`);
      }

      const savedOrder = await res.json();
      this.orders.push(savedOrder);
      this.notifySubscribers();

      if (typeof window !== 'undefined') {
        localStorage.setItem('orders', JSON.stringify(this.orders));
      }

      if (order.customerEmail) {
        try {
          await fetch(this.getApiUrl('/api/send-confirmation'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: order.customerEmail,
              orderId: savedOrder.id,
              orderDetails: savedOrder,
            }),
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }

      return savedOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      return null;
    }
  }

  async refresh(): Promise<void> {
    try {
      await Promise.all([
        this.getOrders(),
        this.getProducts(),
        this.getCategories(),
      ]);
    } catch (error) {
      console.error('Error refreshing store data:', error);
    }
  }
}

export const storeManager = new StoreManager();
