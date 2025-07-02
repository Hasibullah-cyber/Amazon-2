
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: Request) {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    const orderData = await request.json()
    console.log('📦 Processing order:', orderData)
    
    // Generate order ID
    const orderId = `HS-${Date.now()}`
    
    // Calculate totals
    const subtotal = orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const shipping = 50 // Fixed shipping cost for Bangladesh
    const tax = subtotal * 0.05 // 5% VAT
    const total = subtotal + shipping + tax
    
    // Insert order into database
    const orderResult = await client.query(`
      INSERT INTO orders (
        order_id, customer_name, customer_email, customer_phone, 
        address, city, items, subtotal, shipping, tax, total_amount,
        status, payment_method, estimated_delivery
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      orderId,
      orderData.customerInfo.name,
      orderData.customerInfo.email,
      orderData.customerInfo.phone,
      orderData.customerInfo.address,
      orderData.customerInfo.city,
      JSON.stringify(orderData.items),
      subtotal,
      shipping,
      tax,
      total,
      'confirmed',
      orderData.paymentMethod || 'Cash on Delivery',
      '3-5 business days'
    ])
    
    const order = orderResult.rows[0]
    console.log('✅ Order saved to database:', order.order_id)
    
    // Insert order items for better tracking
    for (const item of orderData.items) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        orderId,
        item.id,
        item.name,
        item.quantity,
        item.price,
        item.price * item.quantity
      ])
    }
    
    // Update product stock
    for (const item of orderData.items) {
      await client.query(`
        UPDATE products 
        SET stock = GREATEST(stock - $1, 0), total_sales = total_sales + $1
        WHERE id = $2
      `, [item.quantity, item.id])
    }
    
    // Add to order status history
    await client.query(`
      INSERT INTO order_status_history (order_id, status, notes, created_by)
      VALUES ($1, $2, $3, $4)
    `, [orderId, 'confirmed', 'Order confirmed and payment received', 'system'])
    
    await client.query('COMMIT')
    
    // Send confirmation email (non-blocking)
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://0.0.0.0:3000'}/api/send-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.order_id,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          items: orderData.items,
          total: total
        })
      })
      
      if (emailResponse.ok) {
        console.log('📧 Confirmation email sent successfully')
      } else {
        console.warn('⚠️ Email service unavailable, but order was created')
      }
    } catch (emailError) {
      console.warn('⚠️ Email service unavailable, but order was created:', emailError)
    }
    
    return NextResponse.json({
      success: true,
      orderId: order.order_id,
      message: 'Order placed successfully!',
      order: {
        orderId: order.order_id,
        status: order.status,
        total: order.total_amount,
        estimatedDelivery: order.estimated_delivery
      }
    })
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error processing order:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process order. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          order_id,
          customer_name,
          customer_email,
          total_amount,
          status,
          created_at,
          estimated_delivery
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 50
      `)
      
      return NextResponse.json({
        success: true,
        orders: result.rows
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders'
    }, { status: 500 })
  }
}
