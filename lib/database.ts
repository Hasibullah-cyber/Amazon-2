import { Pool } from 'pg'

// Create connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Initialize database tables
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
    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
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
        estimated_delivery VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(500),
        parent_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('Database tables initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  } finally {
    client.release()
  }
}