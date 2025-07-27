// app/api/track-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const { searchParams } = new URL(request.url)
  const trackingNumber = searchParams.get('trackingNumber')?.trim()

  // Validate input
  if (!trackingNumber) {
    return NextResponse.json({
      success: false,
      error: 'Tracking number is required'
    }, { status: 400 })
  }

  // Basic pattern validation
  if (!/^[A-Z0-9-]{8,20}$/i.test(trackingNumber)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid tracking number format'
    }, { status: 400 })
  }

  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `
        SELECT 
          orders.order_id AS "orderId",
          orders.tracking_number AS "trackingNumber",
          orders.customer_name AS "customerName",
          orders.customer_email AS "customerEmail",
          orders.customer_phone AS "customerPhone",
          orders.total_amount AS "totalAmount",
          orders.payment_method AS "paymentMethod",
          orders.estimated_delivery AS "estimatedDelivery",
          orders.status AS "orderStatus",
          orders.payment_status AS "paymentStatus",
          orders.address,
          orders.city,
          orders.subtotal,
          orders.shipping,
          orders.vat,
          orders.created_at AS "createdAt",
          orders.updated_at AS "updatedAt",
          json_agg(
            json_build_object(
              'name', p.name,
              'price', oi.unit_price,
              'quantity', oi.quantity,
              'image', p.image,
              'sku', p.sku
            )
          ) AS items
        FROM orders
        LEFT JOIN order_items oi ON orders.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE orders.tracking_number = $1
        GROUP BY orders.order_id
        ORDER BY orders.created_at DESC
        LIMIT 1
        `,
        [trackingNumber]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Order not found',
          trackingNumber
        }, { status: 404 })
      }

      const order = result.rows[0]
      
      // Format dates
      const formatDate = (dateString: string) => 
        new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      
      const responseData = {
        ...order,
        estimatedDelivery: order.estimatedDelivery ? formatDate(order.estimatedDelivery) : null,
        createdAt: formatDate(order.createdAt),
        updatedAt: formatDate(order.updatedAt),
      }

      const duration = Date.now() - startTime
      console.log(`Tracked order ${trackingNumber} in ${duration}ms`)

      return NextResponse.json({
        success: true,
        order: responseData
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
        }
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Tracking error:', {
      trackingNumber,
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({
      success: false,
      error: 'Failed to track order',
      trackingNumber,
      details: process.env.NODE_ENV === 'development'
        ? { message: error.message }
        : undefined
    }, { status: 500 })
  }
}
