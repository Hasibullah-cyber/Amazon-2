import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // First try exact match
      let result = await client.query(`
        SELECT * FROM orders 
        WHERE order_id = $1
        ORDER BY created_at DESC
        LIMIT 1
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
        try {
          order.items = JSON.parse(order.items)
        } catch (e) {
          console.error('Error parsing order items:', e)
          order.items = []
        }
      }

      return NextResponse.json({ 
        success: true, 
        order: {
          ...order,
          total: order.total_amount // Add alias for compatibility
        }
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to track order. Please try again later.' 
    }, { status: 500 })
  }
}