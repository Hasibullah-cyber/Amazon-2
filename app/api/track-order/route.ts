import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('trackingNumber')

    if (!trackingNumber) {
      return NextResponse.json({
        success: false,
        error: 'Tracking number is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      const result = await client.query(`
        SELECT 
          order_id as "orderId",
          tracking_number as "trackingNumber",
          customer_name as "customerName",
          customer_email as "customerEmail",
          total_amount as "totalAmount",
          payment_method as "paymentMethod",
          estimated_delivery as "estimatedDelivery",
          status,
          items,
          address,
          city,
          phone,
          subtotal,
          shipping,
          vat,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM orders 
        WHERE tracking_number = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [trackingNumber.trim()])

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Order not found',
          trackingNumber: trackingNumber
        }, { status: 404 })
      }

      const order = result.rows[0]

      // Parse items if stored as JSON string
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
        order: order
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Tracking error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to track order',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    }, { status: 500 })
  }
}
