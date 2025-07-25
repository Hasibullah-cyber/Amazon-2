import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ GET — Get order details by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params

  try {
    const client = await pool.connect()

    try {
      const result = await client.query(
        `
        SELECT o.*, 
               json_agg(json_build_object(
                 'product_id', i.product_id,
                 'quantity', i.quantity,
                 'price', i.price
               )) AS items
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
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('GET /orders/[orderId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ✅ PUT — Update order status or details
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params

  try {
    const { status, notes, updatedBy = 'admin' } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const update = await client.query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, orderId]
      )

      if (update.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by)
         VALUES ($1, $2, $3, $4)`,
        [orderId, status, notes || `Status changed to ${status}`, updatedBy]
      )

      await client.query('COMMIT')

      return NextResponse.json({ success: true, order: update.rows[0] })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('PUT /orders/[orderId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ❌ DELETE — Not implemented (optional)
export async function DELETE() {
  return NextResponse.json(
    { error: 'Delete not allowed on orders' },
    { status: 405 }
  )
}
