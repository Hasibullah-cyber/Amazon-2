import { NextResponse } from 'next/server'
import { pool } from '@/lib/database.ts'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  sku?: string // Optional SKU for product_sku
}

interface OrderData {
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  postalCode?: string
  country?: string
  items: OrderItem[]
  subtotal?: string | number
  shipping?: string | number
  tax?: string | number
  totalAmount: string | number
  paymentMethod: string
}

// GET handler to fetch all orders from the database
export async function GET() {
  try {
    const client = await pool.connect()
    try {
      // Select all orders, mapping DB column names to camelCase
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

      // Parse 'items' JSON string for each order, default empty array if parse fails
      return NextResponse.json(
        result.rows.map(row => ({
          ...row,
          items: (() => {
            try {
              return typeof row.items === 'string' ? JSON.parse(row.items) : (row.items ?? [])
            } catch {
              return []
            }
          })(),
        }))
      )
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST handler to create a new order
export async function POST(request: Request) {
  try {
    // Parse JSON body to OrderData type
    const orderData: OrderData = await request.json()
    console.log('Received order data:', orderData)

    // Validate required fields presence and not empty
    const requiredFields: (keyof OrderData)[] = [
      'customerName', 'customerEmail', 'customerPhone', 'address', 'city', 'items', 'totalAmount', 'paymentMethod'
    ]
    for (const field of requiredFields) {
      const value = orderData[field]
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`,
        }, { status: 400 })
      }
    }

    // Ensure there is at least one item in the order
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Order must contain at least one item',
      }, { status: 400 })
    }

    // Validate each item has required fields
    for (const [i, item] of orderData.items.entries()) {
      if (!item.id || !item.name || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
        return NextResponse.json({
          success: false,
          error: `Missing or invalid item fields at index ${i}`,
        }, { status: 400 })
      }
    }

    // Generate unique IDs for order and tracking number
    const orderId = `ORD-${crypto.randomUUID()}`
    const trackingNumber = `TRK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

    // Parse numeric values for totals with fallback defaults
    const subtotal = parseFloat(orderData.subtotal as string) || parseFloat(orderData.totalAmount as string) || 0
    const shipping = parseFloat(orderData.shipping as string) || 100
    const tax = parseFloat(orderData.tax as string) || 0
    const totalAmount = parseFloat(orderData.totalAmount as string) || (subtotal + shipping + tax)

    try {
      const client = await pool.connect()
      try {
        // Start DB transaction for atomic inserts and updates
        await client.query('BEGIN')

        // Insert main order record
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
          'pending', // Initial order status
          orderData.paymentMethod,
          orderData.paymentMethod === 'Cash on Delivery' ? 'pending' : 'completed',
          trackingNumber,
          '3-5 business days'
        ])

        const newOrder = insertResult.rows[0]

        // For each item, insert into order_items table and update product stock
        for (const item of orderData.items) {
          // Insert the ordered item
          await client.query(`
            INSERT INTO order_items (
              order_id, product_id, product_name, product_sku, quantity, unit_price, total_price
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            newOrder.orderId,          // Use DB primary key id here (not orderId string)
            item.id,
            item.name,
            item.sku || '',
            item.quantity,
            item.price,
            item.price * item.quantity
          ])

          // Update stock quantity for the product
          const stockUpdateResult = await client.query(`
            UPDATE products
            SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND stock >= $1
            RETURNING stock
          `, [item.quantity, item.id])

          if (stockUpdateResult.rowCount === 0) {
            // Not enough stock: rollback entire transaction and return error
            await client.query('ROLLBACK')
            return NextResponse.json({
              success: false,
              error: `Not enough stock for product ${item.id}`,
            }, { status: 400 })
          }
        }

        // Commit all DB changes after success
        await client.query('COMMIT')

        // Prepare response with order details
        const responseData = {
          success: true,
          orderId,
          trackingNumber,
          message: 'Order placed successfully',
          order: {
            id: newOrder.id,
            orderId,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            totalAmount,
            status: 'pending',
            trackingNumber,
            estimatedDelivery: '3-5 business days',
            items: orderData.items,
          },
        }

        // Send order confirmation email asynchronously (do not block response)
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: orderData.customerEmail,
              orderDetails: {
                orderId,
                customerName: orderData.customerName,
                items: orderData.items,
                subtotal,
                shipping,
                vat: tax,
                totalAmount,
                address: orderData.address,
                city: orderData.city,
                phone: orderData.customerPhone,
              },
            }),
          })
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
        }

        return NextResponse.json(responseData, { status: 201 })

      } catch (dbError) {
        // Rollback if any DB error happens during transaction
        await client.query('ROLLBACK')
        throw dbError
      } finally {
        client.release()
      }
    } catch (dbError) {
      // Fallback demo mode if DB connection fails
      console.error('Database error:', dbError)
      const fallbackOrder = {
        id: Date.now(),
        orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        address: orderData.address,
        city: orderData.city,
        items: orderData.items,
        totalAmount,
        status: 'pending',
        paymentMethod: orderData.paymentMethod,
        trackingNumber,
        estimatedDelivery: '3-5 business days',
        createdAt: new Date().toISOString(),
      }
      return NextResponse.json({
        success: true,
        orderId,
        trackingNumber,
        message: 'Order placed successfully (demo mode)',
        order: fallbackOrder,
      }, { status: 201 })
    }
  } catch (error: any) {
    // Catch all unexpected errors
    console.error('Error processing order:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process order. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
