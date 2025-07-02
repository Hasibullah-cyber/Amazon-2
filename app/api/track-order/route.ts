import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    console.log('Tracking order:', orderId)

    // First try to get order from database
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
          WHERE order_id = $1
        `, [orderId])

        if (result.rows.length > 0) {
          const order = result.rows[0]
          order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items

          // Add tracking information to the order
          const orderWithTracking = {
            ...order,
            tracking: {
              orderPlaced: order.createdAt,
              processing: order.status !== 'pending' ? order.createdAt : null,
              shipped: order.status === 'shipped' || order.status === 'delivered' ? order.createdAt : null,
              delivered: order.status === 'delivered' ? order.createdAt : null
            },
            estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          }

          console.log('Order found in database:', orderWithTracking)
          return NextResponse.json({ success: true, order: orderWithTracking })
        }
      } finally {
        client.release()
      }
    } catch (dbError) {
      console.error('Database error, trying fallback:', dbError)
    }

    // Fallback: Return sample tracking data for demo orders
    if (orderId.startsWith('HS-')) {
      const sampleOrder = {
        orderId: orderId,
        status: 'shipped',
        customerName: 'Demo Customer',
        customerEmail: 'demo@example.com',
        customerPhone: '01700000000',
        address: '123 Demo Street',
        city: 'Dhaka',
        totalAmount: 199.99,
        subtotal: 199.99,
        shipping: 120,
        vat: 0,
        paymentMethod: 'Cash on Delivery',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toDateString(),
        tracking: {
          orderPlaced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          processing: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          shipped: new Date().toISOString(),
          delivered: null
        },
        items: [
          { id: '1', name: 'Sample Product', quantity: 1, price: 199.99, image: '/placeholder.svg' }
        ]
      }
      return NextResponse.json({ success: true, order: sampleOrder })
    }

    return NextResponse.json({ error: 'Order not found. Please check your tracking ID and try again.' }, { status: 404 })
  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 })
  }
}