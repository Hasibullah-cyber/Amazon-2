import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const trackingNumber = searchParams.get('trackingNumber')

    // Validate at least one identifier is provided
    if (!orderId && !trackingNumber) {
      return NextResponse.json({
        success: false,
        error: 'Either order ID or tracking number is required'
      }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      // Base query with all necessary fields
      let query = `
        SELECT 
          o.order_id, 
          o.tracking_number,
          o.customer_name,
          o.customer_email,
          o.total_amount,
          o.payment_method,
          o.estimated_delivery,
          o.status,
          o.items,
          o.address,
          o.city,
          o.phone,
          o.created_at,
          o.updated_at,
          o.subtotal,
          o.shipping,
          o.vat
        FROM orders o
        WHERE 1=1
      `
      const params: string[] = []
      let paramIndex = 1

      // Add search conditions
      if (orderId) {
        query += ` AND (o.order_id = $${paramIndex} OR LOWER(o.order_id) = LOWER($${paramIndex}))`
        params.push(orderId)
        paramIndex++
      }
      
      if (trackingNumber) {
        query += ` AND (o.tracking_number = $${paramIndex} OR LOWER(o.tracking_number) = LOWER($${paramIndex}))`
        params.push(trackingNumber)
        paramIndex++
      }

      query += ` ORDER BY o.created_at DESC LIMIT 1`

      const result = await client.query(query, params)

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Order not found',
          details: {
            message: 'No order matches the provided search criteria',
            searchedOrderId: orderId,
            searchedTrackingNumber: trackingNumber
          }
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

      // Format the response
      const responseData = {
        success: true,
        order: {
          orderId: order.order_id,
          trackingNumber: order.tracking_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          totalAmount: order.total_amount,
          paymentMethod: order.payment_method,
          estimatedDelivery: order.estimated_delivery,
          status: order.status,
          items: order.items,
          address: order.address,
          city: order.city,
          phone: order.phone,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          subtotal: order.subtotal,
          shipping: order.shipping,
          vat: order.vat
        }
      }

      return NextResponse.json(responseData)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: {
        message: 'An unexpected error occurred while processing your request',
        code: 'TRACK_ORDER_ERROR'
      }
    }, { status: 500 })
  }
}
