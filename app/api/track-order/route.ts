
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Get order details
      const orderResult = await client.query(`
        SELECT 
          id, order_id as "orderId", user_id as "userId", customer_name as "customerName",
          customer_email as "customerEmail", customer_phone as "customerPhone",
          address, city, items, subtotal, shipping, vat, total_amount as "totalAmount",
          status, payment_method as "paymentMethod", payment_status as "paymentStatus",
          estimated_delivery as "estimatedDelivery", tracking_number as "trackingNumber",
          notes, created_at as "createdAt", updated_at as "updatedAt"
        FROM orders 
        WHERE order_id = $1
      `, [orderId])

      if (orderResult.rows.length > 0) {
        // Get order status history for tracking
        const historyResult = await client.query(`
          SELECT status, notes, created_at as "createdAt"
          FROM order_status_history
          WHERE order_id = $1
          ORDER BY created_at ASC
        `, [orderId])

        const order = {
          ...orderResult.rows[0],
          items: typeof orderResult.rows[0].items === 'string' 
            ? JSON.parse(orderResult.rows[0].items) 
            : orderResult.rows[0].items,
          tracking: {
            orderPlaced: orderResult.rows[0].createdAt,
            processing: historyResult.rows.find(h => h.status === 'processing')?.createdAt || null,
            shipped: historyResult.rows.find(h => h.status === 'shipped')?.createdAt || null,
            delivered: historyResult.rows.find(h => h.status === 'delivered')?.createdAt || null
          },
          statusHistory: historyResult.rows
        }

        return NextResponse.json({ success: true, order })
      }
    } finally {
      client.release()
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
        paymentStatus: 'pending',
        trackingNumber: 'TRK-' + orderId.split('-')[1],
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toDateString(),
        tracking: {
          orderPlaced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          processing: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          shipped: new Date().toISOString(),
          delivered: null
        },
        statusHistory: [
          { status: 'pending', notes: 'Order placed successfully', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { status: 'processing', notes: 'Order is being prepared', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { status: 'shipped', notes: 'Order has been shipped', createdAt: new Date().toISOString() }
        ],
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
