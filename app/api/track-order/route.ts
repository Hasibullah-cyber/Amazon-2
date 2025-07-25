import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

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
      const result = await client.query(
        `
        SELECT 
          order_id AS "orderId",
          tracking_number AS "trackingNumber",
          customer_name AS "customerName",
          customer_email AS "customerEmail",
          customer_phone AS "customerPhone",
          total_amount AS "totalAmount",
          payment_method AS "paymentMethod",
          estimated_delivery AS "estimatedDelivery",
          status,
          items,
          address,
          city,
          subtotal,
          shipping,
          vat,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM orders 
        WHERE tracking_number = $1
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [trackingNumber.trim()]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Order not found',
          trackingNumber
        }, { status: 404 })
      }

      const order = result.rows[0]

      // Parse items if stored as a string
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
        order
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Tracking error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to track order',
      details: process.env.NODE_ENV === 'development'
        ? { message: error.message, stack: error.stack }
        : undefined
    }, { status: 500 })
  }
}
