import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ GET — Get full order details (with items)
export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()

    const result = await client.query(
      `
      SELECT
        o.*,
        (
          SELECT COALESCE(json_agg(json_build_object(
            'product_id', i.product_id,
            'quantity', i.quantity,
            'unit_price', i.unit_price
          )), '[]'::json)
          FROM order_items i
          WHERE i.order_id = o.order_id
        ) AS items
      FROM orders o
      WHERE o.order_id = $1
      `,
      [orderId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (err: any) {
    console.error('GET /admin/orders/[orderId] failed:', err)
    return NextResponse.json(
      { error: 'Database query failed', details: err.message },
      { status: 500 }
    )
  } finally {
    client?.release()
  }
}

// ✅ PUT — Update order status + log to history
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  let body
  try {
    body = await request.json()
  } catch (err: any) {
    console.error('PUT /admin/orders/[orderId] JSON parse error:', err)
    return NextResponse.json(
      { error: 'Invalid JSON payload', details: err.message },
      { status: 400 }
    )
  }

  const { status, notes, updatedBy = 'admin' } = body

  if (!status) {
    return NextResponse.json({ error: 'Missing status field' }, { status: 400 })
  }

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({
      error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
    }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')

    const updateResult = await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    )

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [orderId, status, notes || `Status updated to ${status}`, updatedBy]
    )

    await client.query('COMMIT')
    return NextResponse.json({ success: true, order: updateResult.rows[0] })
  } catch (err: any) {
    await client?.query('ROLLBACK')
    console.error('PUT /admin/orders/[orderId] failed:', err)
    return NextResponse.json(
      { error: 'Order update failed', details: err.message },
      { status: 500 }
    )
  } finally {
    client?.release()
  }
}

// ❌ DELETE — Not allowed for admin orders
export async function DELETE() {
  return NextResponse.json(
    { error: 'Order deletion is not allowed via admin' },
    { status: 405 }
  )
}
