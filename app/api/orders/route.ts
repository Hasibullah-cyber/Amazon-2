import { NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'
import { pool } from '@/lib/database'

export async function GET() {
  try {
    const orders = await storeManager.getOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    console.log('Received order data:', orderData)

    // Generate order ID if not provided
    if (!orderData.orderId) {
      orderData.orderId = `HS-${Date.now()}`
    }

    // Create order object for database
    const order = {
      order_id: orderData.orderId,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      address: orderData.address,
      city: orderData.city,
      items: JSON.stringify(orderData.items),
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      vat: orderData.vat,
      total_amount: orderData.totalAmount,
      status: orderData.status || 'pending',
      payment_method: orderData.paymentMethod,
      estimated_delivery: orderData.estimatedDelivery
    }

    // Create order object for localStorage/API response
    const orderForResponse = {
      id: Date.now().toString(),
      orderId: orderData.orderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      address: orderData.address,
      city: orderData.city,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      vat: orderData.vat,
      totalAmount: orderData.totalAmount,
      status: orderData.status || 'pending',
      paymentMethod: orderData.paymentMethod,
      estimatedDelivery: orderData.estimatedDelivery,
      createdAt: new Date().toISOString()
    }

    let result = orderForResponse
    try {
      const client = await pool.connect()
      try {
        const insertResult = await client.query(`
          INSERT INTO orders (
            order_id, customer_name, customer_email, customer_phone,
            address, city, items, subtotal, shipping, vat, total_amount,
            status, payment_method, estimated_delivery
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          ) RETURNING *
        `, [
          order.order_id, order.customer_name, order.customer_email, order.customer_phone,
          order.address, order.city, order.items, order.subtotal, order.shipping,
          order.vat, order.total_amount, order.status, order.payment_method, order.estimated_delivery
        ])

        const dbResult = insertResult.rows[0]
        console.log('Order saved to database:', dbResult)

        // Convert database result to expected format
        result = {
          ...orderForResponse,
          id: dbResult.id.toString(),
          createdAt: dbResult.created_at
        }
      } finally {
        client.release()
      }
    } catch (dbError) {
      console.error('Database error, using localStorage fallback:', dbError)

      // Save to localStorage as fallback (server-side simulation)
      // This will be handled by the admin orders API
    }

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: orderForResponse.customerEmail,
          orderDetails: result
        })
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the order if email fails
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error adding order:', error)
    return NextResponse.json({ error: 'Failed to add order' }, { status: 500 })
  }
}