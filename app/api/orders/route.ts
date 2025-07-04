import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

// GET all orders
export async function GET() {
  try {
    const client = await pool.connect()
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
      ORDER BY created_at DESC
    `)
    client.release()

    return NextResponse.json(result.rows.map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    })))
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' }, 
      { status: 500 }
    )
  }
}

// POST new order
export async function POST(request: Request) {
  try {
    const orderData = await request.json()

    // Validation
    const requiredFields = ['customerName', 'customerEmail', 'items', 'totalAmount']
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json(
          { error: `Missing ${field}` }, 
          { status: 400 }
        )
      }
    }

    // Generate IDs
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const trackingNumber = `TRK-${Date.now().toString().slice(-8)}`

    // Calculate totals
    const subtotal = orderData.items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0)
    const shipping = orderData.shipping || 100
    const tax = orderData.tax || 0
    const totalAmount = subtotal + shipping + tax

    // Database transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert order
      const orderResult = await client.query(`
        INSERT INTO orders (
          order_id, customer_name, customer_email, items,
          subtotal, shipping, tax, total_amount, tracking_number,
          payment_method, status, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        orderId,
        orderData.customerName,
        orderData.customerEmail,
        JSON.stringify(orderData.items),
        subtotal,
        shipping,
        tax,
        totalAmount,
        trackingNumber,
        orderData.paymentMethod || 'Cash on Delivery',
        'processing',
        'pending'
      ])

      // Insert order items
      for (const item of orderData.items) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES ($1, $2, $3, $4)
        `, [orderId, item.id, item.quantity, item.price])
      }

      await client.query('COMMIT')

      // Send confirmation email (async - don't await)
      fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: orderData.customerEmail,
          orderId,
          trackingNumber
        })
      }).catch(console.error)

      return NextResponse.json({
        success: true,
        orderId,
        trackingNumber,
        redirectUrl: `/order-confirmation?orderId=${orderId}&tracking=${trackingNumber}`,
        order: orderResult.rows[0]
      }, { status: 201 })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Order processing failed' }, 
      { status: 500 }
    )
  }
}
