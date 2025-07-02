
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET() {
  try {
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
        ORDER BY created_at DESC
      `)
      
      return NextResponse.json(result.rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      })))
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    console.log('Received order data:', orderData)

    // Validate required fields
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'address', 'city', 'items', 'totalAmount', 'paymentMethod']
    for (const field of requiredFields) {
      if (!orderData[field]) {
        console.error(`Missing required field: ${field}`)
        return NextResponse.json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order must contain at least one item' 
      }, { status: 400 })
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const trackingNumber = `TRK-${Date.now().toString().substr(-8)}`

    // Calculate totals
    const subtotal = parseFloat(orderData.subtotal) || parseFloat(orderData.totalAmount) || 0
    const shipping = parseFloat(orderData.shipping) || 100
    const tax = parseFloat(orderData.tax) || 0
    const totalAmount = parseFloat(orderData.totalAmount) || (subtotal + shipping + tax)

    try {
      const client = await pool.connect()
      
      try {
        await client.query('BEGIN')

        // Insert order
        const insertResult = await client.query(`
          INSERT INTO orders (
            order_id, customer_name, customer_email, customer_phone,
            address, city, postal_code, country,
            items, subtotal, shipping, tax, total_amount,
            status, payment_method, payment_status,
            tracking_number, estimated_delivery
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING id, order_id as "orderId"
        `, [
          orderId,
          orderData.customerName,
          orderData.customerEmail,
          orderData.customerPhone,
          orderData.address,
          orderData.city,
          orderData.postalCode || '',
          orderData.country || 'Bangladesh',
          JSON.stringify(orderData.items),
          subtotal,
          shipping,
          tax,
          totalAmount,
          'pending',
          orderData.paymentMethod,
          orderData.paymentMethod === 'Cash on Delivery' ? 'pending' : 'completed',
          trackingNumber,
          '3-5 business days'
        ])

        const newOrder = insertResult.rows[0]
        console.log('Order created successfully:', newOrder)

        // Insert order items
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

          // Update product stock if available
          try {
            await client.query(`
              UPDATE products 
              SET stock = GREATEST(0, stock - $1), updated_at = CURRENT_TIMESTAMP 
              WHERE id = $2
            `, [item.quantity, item.id])
          } catch (stockError) {
            console.warn('Could not update stock for product:', item.id, stockError)
          }
        }

        await client.query('COMMIT')

        const responseData = {
          success: true,
          orderId: orderId,
          trackingNumber: trackingNumber,
          message: 'Order placed successfully',
          order: {
            id: newOrder.id,
            orderId: orderId,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            totalAmount: totalAmount,
            status: 'pending',
            trackingNumber: trackingNumber,
            estimatedDelivery: '3-5 business days',
            items: orderData.items
          }
        }

        // Send confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: orderData.customerEmail,
              orderDetails: {
                orderId: orderId,
                customerName: orderData.customerName,
                items: orderData.items,
                subtotal: subtotal,
                shipping: shipping,
                vat: tax,
                totalAmount: totalAmount,
                address: orderData.address,
                city: orderData.city,
                phone: orderData.customerPhone
              }
            })
          })
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
          // Don't fail the order if email fails
        }

        console.log('Sending response:', responseData)
        return NextResponse.json(responseData, { status: 201 })

      } catch (dbError) {
        await client.query('ROLLBACK')
        throw dbError
      } finally {
        client.release()
      }

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Fallback to localStorage for demo
      console.log('Falling back to demo mode')
      
      const fallbackOrder = {
        id: Date.now(),
        orderId: orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        address: orderData.address,
        city: orderData.city,
        items: orderData.items,
        totalAmount: totalAmount,
        status: 'pending',
        paymentMethod: orderData.paymentMethod,
        trackingNumber: trackingNumber,
        estimatedDelivery: '3-5 business days',
        createdAt: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        orderId: orderId,
        trackingNumber: trackingNumber,
        message: 'Order placed successfully (demo mode)',
        order: fallbackOrder
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process order. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
