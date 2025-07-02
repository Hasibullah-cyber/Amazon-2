
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

// Helper function to generate order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `HS-${timestamp}${random}`.toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    console.log('Received order data:', orderData)

    // Validate required fields
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'address', 'city', 'items', 'subtotal', 'shipping', 'vat', 'totalAmount', 'paymentMethod']
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Generate order ID
    const orderId = generateOrderId()
    console.log('Generated order ID:', orderId)

    // Prepare order data
    const order = {
      orderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      address: orderData.address,
      city: orderData.city,
      items: JSON.stringify(orderData.items),
      subtotal: parseFloat(orderData.subtotal),
      shipping: parseFloat(orderData.shipping),
      vat: parseFloat(orderData.vat),
      totalAmount: parseFloat(orderData.totalAmount),
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'pending',
      estimatedDelivery: orderData.estimatedDelivery || '3-5 business days',
      notes: orderData.notes || null
    }

    // Store in database if available
    if (pool) {
      const client = await pool.connect()
      try {
        const result = await client.query(`
          INSERT INTO orders (
            order_id, customer_name, customer_email, customer_phone,
            address, city, items, subtotal, shipping, vat, total_amount,
            status, payment_method, payment_status, estimated_delivery, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING id, order_id as "orderId", created_at as "createdAt"
        `, [
          order.orderId, order.customerName, order.customerEmail, order.customerPhone,
          order.address, order.city, order.items, order.subtotal, order.shipping,
          order.vat, order.totalAmount, order.status, order.paymentMethod,
          order.paymentStatus, order.estimatedDelivery, order.notes
        ])

        console.log('Order stored in database:', result.rows[0])

        // Try to send confirmation email
        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://0.0.0.0:3000'}/api/send-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: order.customerEmail,
              orderDetails: {
                orderId: order.orderId,
                customerName: order.customerName,
                items: orderData.items,
                subtotal: order.subtotal,
                shipping: order.shipping,
                vat: order.vat,
                totalAmount: order.totalAmount,
                address: order.address,
                city: order.city,
                phone: order.customerPhone
              }
            })
          })
          
          const emailResult = await emailResponse.json()
          if (emailResult.success) {
            console.log('✅ Order confirmation email sent successfully')
          } else {
            console.error('❌ Failed to send order confirmation email:', emailResult.error)
          }
        } catch (emailError) {
          console.error('❌ Error sending confirmation email:', emailError)
        }

        return NextResponse.json({
          success: true,
          orderId: order.orderId,
          message: 'Order placed successfully',
          order: {
            ...order,
            id: result.rows[0].id,
            createdAt: result.rows[0].createdAt,
            items: orderData.items
          }
        })
      } finally {
        client.release()
      }
    } else {
      console.warn('Database not available, order not stored')
      return NextResponse.json({
        success: false,
        error: 'Database unavailable - order could not be processed'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create order'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!pool) {
      return NextResponse.json({ orders: [] })
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
        ORDER BY created_at DESC
      `)

      const orders = result.rows.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }))

      return NextResponse.json({ orders })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ orders: [] })
  }
}
