
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST() {
  try {
    const client = await pool.connect()

    try {
      // Create orders table
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          order_id VARCHAR(255) UNIQUE NOT NULL,
          user_id VARCHAR(255),
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(20),
          address TEXT,
          city VARCHAR(100),
          items JSONB NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
          vat DECIMAL(10,2) NOT NULL DEFAULT 0,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          payment_method VARCHAR(100),
          payment_status VARCHAR(50) DEFAULT 'pending',
          estimated_delivery VARCHAR(100),
          tracking_number VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create order status history table
      await client.query(`
        CREATE TABLE IF NOT EXISTS order_status_history (
          id SERIAL PRIMARY KEY,
          order_id VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(order_id)
        )
      `)

      console.log('✅ Orders tables created successfully')
      return NextResponse.json({ success: true, message: 'Orders tables initialized' })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error initializing orders tables:', error)
    return NextResponse.json({ success: false, error: 'Failed to initialize orders tables' }, { status: 500 })
  }
}
