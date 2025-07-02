
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
    // Create categories table first (referenced by products)
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(500),
        parent_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        image VARCHAR(500),
        stock INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create orders table with enhanced fields
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
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        shipping DECIMAL(10,2) NOT NULL,
        vat DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        estimated_delivery VARCHAR(100),
        tracking_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create order_status_history table for tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(order_id),
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create admin_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert sample data if tables are empty
    await insertSampleData(client)

    console.log('Database tables initialized successfully with full schema')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  } finally {
    client.release()
  }
}

// Insert sample data for testing
async function insertSampleData(client: any) {
  try {
    // Check if we already have data
    const orderCount = await client.query('SELECT COUNT(*) FROM orders')
    if (parseInt(orderCount.rows[0].count) > 0) {
      console.log('Sample data already exists, skipping insertion')
      return
    }

    // Insert sample categories
    await client.query(`
      INSERT INTO categories (name, slug, description) VALUES
      ('Electronics', 'electronics', 'Latest electronic devices and gadgets'),
      ('Fashion', 'fashion', 'Trendy clothing and accessories'),
      ('Home & Living', 'home-living', 'Home decoration and living essentials'),
      ('Beauty', 'beauty', 'Beauty and personal care products')
      ON CONFLICT (slug) DO NOTHING
    `)

    // Insert sample products
    await client.query(`
      INSERT INTO products (name, description, price, category, image, stock, rating, reviews, featured) VALUES
      ('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 'electronics', '/placeholder.svg', 50, 4.5, 128, true),
      ('Smart Watch Pro', 'Advanced smartwatch with health monitoring', 299.99, 'electronics', '/placeholder.svg', 30, 4.7, 89, true),
      ('Casual T-Shirt', 'Comfortable cotton t-shirt for everyday wear', 29.99, 'fashion', '/placeholder.svg', 100, 4.2, 45, false),
      ('Running Shoes', 'Professional running shoes for athletes', 129.99, 'fashion', '/placeholder.svg', 25, 4.6, 67, true)
      ON CONFLICT DO NOTHING
    `)

    // Insert sample users
    await client.query(`
      INSERT INTO users (user_id, name, email, phone, address, city) VALUES
      ('user_1', 'John Doe', 'john@example.com', '01700000000', '123 Main St', 'Dhaka'),
      ('user_2', 'Jane Smith', 'jane@example.com', '01800000000', '456 Oak Ave', 'Chittagong')
      ON CONFLICT (user_id) DO NOTHING
    `)

    // Insert sample orders
    await client.query(`
      INSERT INTO orders (order_id, user_id, customer_name, customer_email, customer_phone, address, city, items, subtotal, shipping, vat, total_amount, status, payment_method, estimated_delivery, tracking_number) VALUES
      ('HS-1234567890', 'user_1', 'John Doe', 'john@example.com', '01700000000', '123 Main St', 'Dhaka', '[{"id":"1","name":"Premium Wireless Headphones","price":199.99,"quantity":1,"image":"/placeholder.svg"}]', 199.99, 120.00, 31.99, 351.98, 'shipped', 'Cash on Delivery', '2-3 business days', 'TRK-123456789'),
      ('HS-0987654321', 'user_2', 'Jane Smith', 'jane@example.com', '01800000000', '456 Oak Ave', 'Chittagong', '[{"id":"2","name":"Smart Watch Pro","price":299.99,"quantity":1,"image":"/placeholder.svg"}]', 299.99, 120.00, 41.99, 461.98, 'processing', 'Cash on Delivery', '3-4 business days', 'TRK-987654321'),
      ('HS-1122334455', 'user_1', 'John Doe', 'john@example.com', '01700000000', '123 Main St', 'Dhaka', '[{"id":"3","name":"Casual T-Shirt","price":29.99,"quantity":2,"image":"/placeholder.svg"}]', 59.98, 120.00, 9.60, 189.58, 'delivered', 'Cash on Delivery', '1-2 business days', 'TRK-112233445')
      ON CONFLICT (order_id) DO NOTHING
    `)

    // Insert order status history
    await client.query(`
      INSERT INTO order_status_history (order_id, status, notes) VALUES
      ('HS-1234567890', 'pending', 'Order placed successfully'),
      ('HS-1234567890', 'processing', 'Order is being prepared'),
      ('HS-1234567890', 'shipped', 'Order has been shipped'),
      ('HS-0987654321', 'pending', 'Order placed successfully'),
      ('HS-0987654321', 'processing', 'Order is being prepared'),
      ('HS-1122334455', 'pending', 'Order placed successfully'),
      ('HS-1122334455', 'processing', 'Order is being prepared'),
      ('HS-1122334455', 'shipped', 'Order has been shipped'),
      ('HS-1122334455', 'delivered', 'Order delivered successfully')
    `)

    console.log('Sample data inserted successfully')
  } catch (error) {
    console.error('Error inserting sample data:', error)
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

// Update order status with history tracking
export async function updateOrderStatus(orderId: string, newStatus: string, notes?: string) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Update order status
    await client.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2',
      [newStatus, orderId]
    )
    
    // Add to status history
    await client.query(
      'INSERT INTO order_status_history (order_id, status, notes) VALUES ($1, $2, $3)',
      [orderId, newStatus, notes || `Status changed to ${newStatus}`]
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
