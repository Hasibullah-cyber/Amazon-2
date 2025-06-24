
import { Pool } from 'pg'

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Database schema initialization
export async function initializeDatabase() {
  const client = await pool.connect()
  
  try {
    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        subcategories JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        category VARCHAR(255),
        image VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(255),
        address TEXT,
        city VARCHAR(255),
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        shipping DECIMAL(10,2) DEFAULT 0,
        vat DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(100),
        estimated_delivery VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Insert default categories
    await client.query(`
      INSERT INTO categories (id, name, description, subcategories) VALUES
      ('electronics', 'Electronics', 'Cutting-edge gadgets and devices', '[
        {"id": "mobile-phones", "name": "Mobile Phones", "description": "Smartphones and feature phones"},
        {"id": "headphones", "name": "Headphones & Earphones", "description": "Audio devices and accessories"},
        {"id": "laptops", "name": "Laptops & Computers", "description": "Computing devices"},
        {"id": "smartwatches", "name": "Smartwatches", "description": "Fitness and smart wearables"}
      ]'),
      ('fashion', 'Fashion', 'Stylish apparel and accessories', '[
        {"id": "sarees", "name": "Sarees", "description": "Traditional and designer sarees"},
        {"id": "clothing", "name": "Clothing", "description": "Men''s and women''s clothing"},
        {"id": "accessories", "name": "Accessories", "description": "Fashion accessories"}
      ]'),
      ('home-living', 'Home & Living', 'Beautiful furnishings and decor', '[
        {"id": "candles", "name": "Candles & Aromatherapy", "description": "Scented candles and aromatherapy"},
        {"id": "furniture", "name": "Furniture", "description": "Home furniture and decor"}
      ]'),
      ('beauty', 'Beauty & Personal Care', 'Premium self-care products', '[
        {"id": "skincare", "name": "Skincare", "description": "Skincare products and treatments"},
        {"id": "makeup", "name": "Makeup", "description": "Cosmetics and beauty products"}
      ]')
      ON CONFLICT (id) DO NOTHING
    `)

    // Insert default products
    await client.query(`
      INSERT INTO products (id, name, price, stock, category, image, description) VALUES
      ('101', 'Premium Wireless Headphones', 220.00, 15, 'electronics', '/placeholder.svg?height=400&width=400', 'High-quality wireless headphones with noise cancellation'),
      ('102', 'Smart Fitness Watch', 165.00, 8, 'electronics', '/placeholder.svg?height=400&width=400', 'Advanced fitness tracking with heart rate monitor'),
      ('201', 'Designer Sunglasses', 88.00, 23, 'fashion', '/placeholder.svg?height=400&width=400', 'Stylish sunglasses with UV protection'),
      ('301', 'Scented Candle Set', 35.00, 42, 'home-living', '/placeholder.svg?height=400&width=400', 'Set of 3 premium scented candles')
      ON CONFLICT (id) DO NOTHING
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  } finally {
    client.release()
  }
}

export { pool }
