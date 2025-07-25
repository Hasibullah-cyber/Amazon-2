import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ GET — Get order details by ID including order items
export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log('GET orderId:', orderId)

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  try {
    const client = await pool.connect()

    try {
      const result = await client.query(
        `
        SELECT o.*, 
               COALESCE(json_agg(json_build_object(
                 'product_id', i.product_id,
                 'quantity', i.quantity,
                 'price', i.price
               )) FILTER (WHERE i.product_id IS NOT NULL), '[]'::json) AS items
        FROM orders o
        LEFT JOIN order_items i ON o.id = i.order_id
        WHERE o.id = $1
        GROUP BY o.id
        `,
        [orderId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json(result.rows[0])
    } catch (dbError) {
      console.error('DB query error (GET order):', dbError)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('GET /orders/[orderId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ✅ PUT — Update order status and add to status history
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log('PUT orderId:', orderId)

  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  try {
    const { status, notes, updatedBy = 'admin' } = await request.json()
    console.log('PUT payload:', { status, notes, updatedBy })

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Update order status
      const updateResult = await client.query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, orderId]
      )

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Insert into order_status_history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [orderId, status, notes || `Status changed to ${status}`, updatedBy]
      )

      await client.query('COMMIT')

      return NextResponse.json({ success: true, order: updateResult.rows[0] })
    } catch (dbError) {
      await client.query('ROLLBACK')
      console.error('DB transaction error (PUT order):', dbError)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('PUT /orders/[orderId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ❌ DELETE — Not implemented for safety
export async function DELETE() {
  return NextResponse.json(
    { error: 'Delete not allowed on orders' },
    { status: 405 }
  )
}
