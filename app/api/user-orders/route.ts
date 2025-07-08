import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(request: Request) {
  let client
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    client = await pool.connect()
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

    const orders = result.rows.map(row => ({
      ...row,
      items: (() => {
        if (typeof row.items === 'string') {
          try {
            return JSON.parse(row.items)
          } catch {
            return []
          }
        }
        return row.items
      })()
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}
