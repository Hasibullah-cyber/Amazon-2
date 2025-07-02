import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📦 Received order:', body)

    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      items,
      subtotal,
      shipping,
      vat,
      totalAmount,
      status = 'pending',
      paymentMethod,
      paymentStatus = 'pending',
      transactionId,
      estimatedDelivery,
      userId
    } = body

    // Validate required fields
    if (!orderId || !customerName || !customerEmail || !items || !totalAmount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Check if database is available
    if (!pool) {
      console.warn('Database not available, order cannot be saved')
      return NextResponse.json({ 
        success: false, 
        error: 'Database service unavailable. Please contact support.' 
      }, { status: 503 })
    }

    const client = await pool.connect()
    try {
      // Check if order already exists
      const existingOrder = await client.query(
        'SELECT id FROM orders WHERE order_id = $1',
        [orderId]
      )

      if (existingOrder.rows.length > 0) {
        console.log('✅ Order already exists, returning success')
        return NextResponse.json({
          success: true,
          orderId: orderId,
          message: 'Order already processed'
        })
      }

      // Insert order into database
      const result = await client.query(`
        INSERT INTO orders (
          order_id, customer_name, customer_email, customer_phone,
          address, city, items, subtotal, shipping, vat, total_amount,
          status, payment_method, payment_status, transaction_id,
          estimated_delivery, user_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
        ) RETURNING id
      `, [
        orderId, customerName, customerEmail, customerPhone,
        address, city, JSON.stringify(items), subtotal, shipping, vat, totalAmount,
        status, paymentMethod, paymentStatus, transactionId,
        estimatedDelivery, userId
      ])

      const order = result.rows[0]
      console.log('✅ Order saved to database:', order.id)

      // Send confirmation email (non-blocking)
      try {
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://0.0.0.0:3000'}/api/send-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            customerEmail,
            customerName,
            items,
            totalAmount
          })
        })

        if (!emailResponse.ok) {
          console.warn('Failed to send confirmation email, but order was created')
        } else {
          console.log('✅ Confirmation email sent successfully')
        }
      } catch (emailError) {
        console.error('❌ Error sending confirmation email:', emailError)
      }

      return NextResponse.json({
        success: true,
        orderId: orderId,
        message: 'Order created successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error creating order:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'There was an error processing your order. Please contact support.' 
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