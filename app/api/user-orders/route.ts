import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    console.log('Fetching orders for email:', email)

    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT 
          id, order_id as "orderId", customer_name as "customerName",
          customer_email as "customerEmail", customer_phone as "customerPhone",
          address, city, postal_code as "postalCode", country,
          items, subtotal, shipping, tax, total_amount as "totalAmount",
          status, payment_method as "paymentMethod", payment_status as "paymentStatus",
          tracking_number as "trackingNumber", estimated_delivery as "estimatedDelivery",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM orders 
        WHERE customer_email = $1
        ORDER BY created_at DESC
      `, [email])

      console.log(`Found ${result.rows.length} orders for email: ${email}`)

      const orders = result.rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }))

      return NextResponse.json(orders)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching user orders:', error)

    // Fallback: return empty array for demo
    console.log('Returning empty array as fallback')
    return NextResponse.json([])
  }
}