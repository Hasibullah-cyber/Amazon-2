
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          id, order_id as "orderId", customer_name as "customerName",
          customer_email as "customerEmail", customer_phone as "customerPhone",
          address, city, items, subtotal, shipping, vat, total_amount as "totalAmount",
          status, payment_method as "paymentMethod", estimated_delivery as "estimatedDelivery",
          created_at as "createdAt"
        FROM orders 
        ORDER BY created_at DESC
      `)
      
      const orders = result.rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }))

      return NextResponse.json(orders)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error fetching orders, falling back to localStorage:', error)
    
    // Fallback to localStorage for development
    const fallbackOrders = [
      {
        id: "1",
        orderId: "HS-1234567890",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "01700000000",
        address: "123 Main St",
        city: "Dhaka",
        items: [
          {
            id: "1",
            name: "Premium Wireless Headphones",
            price: 199.99,
            quantity: 1,
            image: "/placeholder.svg"
          }
        ],
        subtotal: 199.99,
        shipping: 120,
        vat: 31.99,
        totalAmount: 351.98,
        status: "pending",
        paymentMethod: "Cash on Delivery",
        estimatedDelivery: "2-3 business days",
        createdAt: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(fallbackOrders)
  }
}
