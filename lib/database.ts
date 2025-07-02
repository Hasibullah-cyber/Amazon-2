
import { Pool } from 'pg'

// Create connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test database connection
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log('Database connected successfully:', result.rows[0])
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Initialize database tables with full schema
export async function initializeDatabase() {
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL || 
      process.env.DATABASE_URL.includes('base') || 
      process.env.DATABASE_URL.includes('your_database_url_here') ||
      process.env.DATABASE_URL === 'your_database_url_here') {
    console.warn('DATABASE_URL is not properly configured. App will run in demo mode without database.')
    return false
  }

  const client = await pool.connect()

  try {
    // Drop existing tables with foreign key constraints to avoid conflicts
    await client.query('DROP TABLE IF EXISTS order_items CASCADE')
    await client.query('DROP TABLE IF EXISTS order_status_history CASCADE')
    await client.query('DROP TABLE IF EXISTS product_reviews CASCADE')
    await client.query('DROP TABLE IF EXISTS inventory_logs CASCADE')
    // Create categories table first (referenced by products)
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(500),
        parent_id INTEGER REFERENCES categories(id),
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create products table with enhanced fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'prod_' || generate_random_uuid()::text,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        sale_price DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        category_id INTEGER REFERENCES categories(id),
        category VARCHAR(100) NOT NULL,
        image TEXT,
        images JSONB DEFAULT '[]',
        description TEXT,
        short_description TEXT,
        specifications JSONB DEFAULT '{}',
        features JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        sku VARCHAR(100) UNIQUE,
        weight DECIMAL(8,2),
        dimensions JSONB DEFAULT '{}',
        featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        reviews INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        total_sales INTEGER DEFAULT 0,
        meta_title VARCHAR(255),
        meta_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create users table with enhanced fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Bangladesh',
        date_of_birth DATE,
        gender VARCHAR(20),
        is_admin BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create enhanced orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        user_id VARCHAR(50) REFERENCES users(user_id),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Bangladesh',
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        shipping DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_reference VARCHAR(100),
        transaction_id VARCHAR(100),
        estimated_delivery VARCHAR(100),
        tracking_number VARCHAR(100),
        shipped_at TIMESTAMP,
        delivered_at TIMESTAMP,
        notes TEXT,
        admin_notes TEXT,
        cancellation_reason TEXT,
        refund_amount DECIMAL(10,2) DEFAULT 0,
        refund_status VARCHAR(20) DEFAULT 'none',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create order_items table for better structure
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(order_id),
        product_id VARCHAR(50),
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `)

    // Create order_status_history table for tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(order_id),
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create admin_users table with enhanced security
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        permissions JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create product_reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) REFERENCES products(id),
        user_id VARCHAR(50) REFERENCES users(user_id),
        order_id VARCHAR(50) REFERENCES orders(order_id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        review_text TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT FALSE,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create inventory_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) REFERENCES products(id),
        change_type VARCHAR(50) NOT NULL,
        quantity_before INTEGER,
        quantity_after INTEGER,
        quantity_changed INTEGER,
        reason VARCHAR(255),
        reference_id VARCHAR(100),
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
        discount_value DECIMAL(10,2) NOT NULL,
        minimum_amount DECIMAL(10,2) DEFAULT 0,
        maximum_discount DECIMAL(10,2),
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        starts_at TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create comprehensive indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
      CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
      CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
      CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));
      
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
      CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
      
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
      
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews(is_approved);
    `)

    // Create additional indexes that depend on foreign keys and all columns exist
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    `)

    console.log('Database tables initialized successfully with full schema')

    // Initialize default admin user
    const { initializeDefaultAdmin } = await import('./admin-auth')
    await initializeDefaultAdmin()

    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  } finally {
    client.release()
  }
}

// Helper function to execute queries safely
export async function executeQuery(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// Export alias for backwards compatibility
export const initializeTables = initializeDatabase

// Update order status with history tracking
export async function updateOrderStatus(orderId: string, newStatus: string, notes?: string, updatedBy?: string) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Update order status and timestamp
    const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP']
    const updateValues = [newStatus, orderId]
    
    if (newStatus === 'shipped') {
      updateFields.push('shipped_at = CURRENT_TIMESTAMP')
    } else if (newStatus === 'delivered') {
      updateFields.push('delivered_at = CURRENT_TIMESTAMP')
    }

    await client.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE order_id = $${updateValues.length}`,
      updateValues
    )

    // Add to status history
    await client.query(
      'INSERT INTO order_status_history (order_id, status, notes, created_by) VALUES ($1, $2, $3, $4)',
      [orderId, newStatus, notes || `Status changed to ${newStatus}`, updatedBy || 'system']
    )

    await client.query('COMMIT')
    return true
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error updating order status:', error)
    return false
  } finally {
    client.release()
  }
}

// Add inventory tracking
export async function updateProductStock(productId: string, newStock: number, reason: string, referenceId?: string, updatedBy?: string) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Get current stock
    const currentResult = await client.query('SELECT stock FROM products WHERE id = $1', [productId])
    const currentStock = currentResult.rows[0]?.stock || 0

    // Update product stock
    await client.query(
      'UPDATE products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStock, productId]
    )

    // Log inventory change
    await client.query(`
      INSERT INTO inventory_logs (product_id, change_type, quantity_before, quantity_after, quantity_changed, reason, reference_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      productId,
      newStock > currentStock ? 'increase' : 'decrease',
      currentStock,
      newStock,
      newStock - currentStock,
      reason,
      referenceId,
      updatedBy || 'system'
    ])

    await client.query('COMMIT')
    return true
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error updating product stock:', error)
    return false
  } finally {
    client.release()
  }
}
