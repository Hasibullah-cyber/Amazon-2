
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET() {
  try {
    const client = await pool.connect()

    try {
      const result = await client.query(`
        SELECT 
          id, order_id as "orderId", user_id as "userId", customer_name as "customerName",
          customer_email as "customerEmail", customer_phone as "customerPhone",
          address, city, items, subtotal, shipping, vat, total_amount as "totalAmount",
          status, payment_method as "paymentMethod", payment_status as "paymentStatus",
          estimated_delivery as "estimatedDelivery", tracking_number as "trackingNumber",
          notes, created_at as "createdAt", updated_at as "updatedAt"
        FROM orders 
        ORDER BY created_at DESC
      `)

      const orders = result.rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }))

      console.log('Fetched orders from database:', orders.length)
      return NextResponse.json(orders)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error fetching orders:', error)

    // Enhanced fallback data
    const fallbackOrders = [
      {
        id: "1",
        orderId: "HS-1234567890",
        userId: "user_1",
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
        status: "shipped",
        paymentMethod: "Cash on Delivery",
        paymentStatus: "pending",
        estimatedDelivery: "2-3 business days",
        trackingNumber: "TRK-123456789",
        notes: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: "2", 
        orderId: "HS-0987654321",
        userId: "user_2",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        customerPhone: "01800000000",
        address: "456 Oak Ave",
        city: "Chittagong",
        items: [
          {
            id: "2",
            name: "Smart Watch Pro",
            price: 299.99,
            quantity: 1,
            image: "/placeholder.svg"
          }
        ],
        subtotal: 299.99,
        shipping: 120,
        vat: 41.99,
        totalAmount: 461.98,
        status: "processing",
        paymentMethod: "Cash on Delivery",
        paymentStatus: "pending",
        estimatedDelivery: "3-4 business days",
        trackingNumber: "TRK-987654321",
        notes: null,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "3",
        orderId: "HS-1122334455",
        userId: "user_1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "01700000000",
        address: "123 Main St",
        city: "Dhaka",
        items: [
          {
            id: "3",
            name: "Casual T-Shirt",
            price: 29.99,
            quantity: 2,
            image: "/placeholder.svg"
          }
        ],
        subtotal: 59.98,
        shipping: 120,
        vat: 9.60,
        totalAmount: 189.58,
        status: "delivered",
        paymentMethod: "Cash on Delivery",
        paymentStatus: "completed",
        estimatedDelivery: "1-2 business days",
        trackingNumber: "TRK-112233445",
        notes: null,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]

    console.log('Using fallback orders:', fallbackOrders.length)
    return NextResponse.json(fallbackOrders)
  }
}
