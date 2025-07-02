
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    // Check if database is available
    if (!pool) {
      console.warn('Database not available, returning empty orders')
      return NextResponse.json([])
    }

    const client = await pool.connect()
    try {
      const result = await client.query(`
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
        WHERE customer_email = $1
        ORDER BY created_at DESC
      `, [userEmail])

      const orders = result.rows.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }))

      return NextResponse.json(orders)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json([])
  }
}
