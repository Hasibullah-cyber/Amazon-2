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
    const order = await request.json()
    console.log('API: Creating new order:', order.orderId)

    // First try to add to database
    try {
      const client = await pool.connect()
      try {
        const result = await client.query(`
          INSERT INTO orders (
            order_id, customer_name, customer_email, customer_phone,
            address, city, items, subtotal, shipping, vat, total_amount,
            status, payment_method, estimated_delivery, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *
        `, [
          order.orderId,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.address,
          order.city,
          JSON.stringify(order.items),
          order.subtotal,
          order.shipping,
          order.vat,
          order.totalAmount,
          order.status || 'pending',
          order.paymentMethod,
          order.estimatedDelivery,
          new Date().toISOString()
        ])

        const dbOrder = {
          ...result.rows[0],
          id: result.rows[0].id.toString(),
          items: JSON.parse(result.rows[0].items),
          createdAt: result.rows[0].created_at
        }

        console.log('Order saved to database:', dbOrder.order_id)
        
         // Send confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: order.customerEmail,
              orderDetails: dbOrder
            })
          })
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
          // Don't fail the order if email fails
        }

        return NextResponse.json(dbOrder)
      } finally {
        client.release()
      }
    } catch (dbError) {
      console.error('Database error, using store manager:', dbError)
      // Fallback to store manager
      const newOrder = await storeManager.addOrder(order)
            // Send confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: order.customerEmail,
              orderDetails: newOrder
            })
          })
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
          // Don't fail the order if email fails
        }

      return NextResponse.json(newOrder)
    }
  } catch (error) {
    console.error('Error adding order:', error)
    return NextResponse.json({ error: 'Failed to add order' }, { status: 500 })
  }
}