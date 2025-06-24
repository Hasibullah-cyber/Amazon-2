
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export { pool }

export async function initializeDatabase() {
  try {
    const client = await pool.connect()

    try {
      // Create products table
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(500) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          stock INTEGER DEFAULT 0,
          category VARCHAR(255),
          image VARCHAR(500),
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)

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

      // Create orders table
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(255) PRIMARY KEY,
          order_id VARCHAR(255) UNIQUE NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50),
          address TEXT NOT NULL,
          city VARCHAR(255) NOT NULL,
          items JSONB NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          shipping DECIMAL(10,2) DEFAULT 0,
          vat DECIMAL(10,2) DEFAULT 0,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(100) NOT NULL,
          estimated_delivery DATE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)

      // Insert sample data if tables are empty
      const productCount = await client.query('SELECT COUNT(*) FROM products')
      if (parseInt(productCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO products (id, name, price, stock, category, image, description) VALUES
          ('1', 'Premium Wireless Headphones', 199.99, 50, 'electronics', '/placeholder.svg?height=300&width=300', 'Immersive sound quality with noise cancellation technology.'),
          ('2', 'Designer Sunglasses', 79.99, 30, 'fashion', '/placeholder.svg?height=300&width=300', 'Protect your eyes with style and elegance.'),
          ('3', 'Scented Candle Set', 34.99, 100, 'home-living', '/placeholder.svg?height=300&width=300', 'Set of 3 premium scented candles for a relaxing atmosphere.'),
          ('4', 'Luxury Skincare Set', 129.99, 25, 'beauty', '/placeholder.svg?height=300&width=300', 'Complete skincare routine with premium ingredients.')
        `)
      }

      const categoryCount = await client.query('SELECT COUNT(*) FROM categories')
      if (parseInt(categoryCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO categories (id, name, description, subcategories) VALUES
          ('electronics', 'Electronics', 'Latest gadgets and electronic devices', '[]'),
          ('fashion', 'Fashion', 'Trendy clothing and accessories', '[]'),
          ('home-living', 'Home & Living', 'Home decor and living essentials', '[]'),
          ('beauty', 'Beauty & Personal Care', 'Beauty products and personal care items', '[]')
        `)
      }

      console.log('Database initialized successfully')
    } catch (error) {
      console.error('Error initializing database:', error)
      throw error
    } finally {
      client.release()
    }
  } catch (connectionError) {
    console.error('Failed to connect to database:', connectionError)
    // Don't throw here to allow app to start without database
    console.log('App will continue without database functionality')
  }
}
