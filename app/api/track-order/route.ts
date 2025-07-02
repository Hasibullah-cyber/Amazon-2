import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Check if database is available
    if (!pool) {
      console.warn('Database not available, using fallback data')
      return NextResponse.json({ error: 'Order tracking system temporarily unavailable' }, { status: 503 })
    }

    const client = await pool.connect()
    try {
      // Query order from database
      let result = await client.query(`
        SELECT 
          id,
          order_id as "orderId",
          customer_name as "customerName",
          customer_email as "customerEmail", 
          customer_phone as "customerPhone",
          address,
          city,
          items,
          subtotal,
          shipping,
          vat,
          total_amount as "totalAmount",
          status,
          payment_method as "paymentMethod",
          payment_status as "paymentStatus",
          estimated_delivery as "estimatedDelivery",
          tracking_number as "trackingNumber",
          notes,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM orders 
        WHERE order_id = $1
      `, [orderId])

      if (result.rows.length === 0) {
      // Try to find order with different case or formatting
      const fallbackResult = await client.query(`
        SELECT * FROM orders 
        WHERE LOWER(order_id) = LOWER($1) 
        OR order_id LIKE $2
        ORDER BY created_at DESC
        LIMIT 1
      `, [orderId, `%${orderId}%`])

      if (fallbackResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: `Order ${orderId} not found. Please check your order ID and try again.`
        }, { status: 404 })
      }

      result = fallbackResult
    }

      const order = result.rows[0]

      // Parse items if it's a string
      if (typeof order.items === 'string') {
        order.items = JSON.parse(order.items)
      }

      return NextResponse.json({ 
        success: true, 
        order: {
          ...order,
          total: order.totalAmount // Add alias for compatibility
        }
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 })
  }
}