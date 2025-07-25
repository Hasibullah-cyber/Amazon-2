import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ GET — Admin fetch order by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log('[GET] Fetching order by ID:', orderId)

  if (!orderId) {
    console.log('[GET] Missing orderId in params')
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    console.log('[GET] DB client acquired')

    const result = await client.query(
      `
      SELECT
        o.*,
        (
          SELECT json_agg(json_build_object(
            'product_id', i.product_id,
            'quantity', i.quantity,
            'unit_price', i.unit_price
          )) FROM order_items i
          WHERE i.order_id = o.order_id
        ) AS items
      FROM orders o
      WHERE o.order_id = $1
      `,
      [orderId]
    )

    if (result.rows.length === 0) {
      console.log('[GET] No order found with ID:', orderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('[GET] Order retrieved successfully:', result.rows[0])
    return NextResponse.json(result.rows[0])
  } catch (err: any) {
    console.error('[GET] Error fetching order:', err.message)
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 })
  } finally {
    client?.release()
    console.log('[GET] DB client released')
  }
}

// ✅ PUT — Admin updates order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log('[PUT] Attempting to update order:', orderId)

  if (!orderId) {
    console.log('[PUT] Missing orderId in params')
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  let payload: { status?: string; notes?: string; updatedBy?: string }
  try {
    payload = await request.json()
    console.log('[PUT] Received payload:', payload)
  } catch (err) {
    console.error('[PUT] Invalid JSON payload')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, notes, updatedBy = 'admin' } = payload

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!status || !allowedStatuses.includes(status)) {
    console.log('[PUT] Invalid or missing status:', status)
    return NextResponse.json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    console.log('[PUT] DB client acquired')
    await client.query('BEGIN')
    console.log('[PUT] Transaction started')

    const updated = await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    )

    if (updated.rowCount === 0) {
      console.log('[PUT] No order found with ID:', orderId)
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('[PUT] Order status updated:', updated.rows[0])

    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [orderId, status, notes || `Status changed to ${status}`, updatedBy]
    )
    console.log('[PUT] Status history inserted')

    await client.query('COMMIT')
    console.log('[PUT] Transaction committed')

    return NextResponse.json({ success: true, order: updated.rows[0] })
  } catch (err: any) {
    console.error('[PUT] Error during update:', err.message)
    await client?.query('ROLLBACK')
    return NextResponse.json({ error: 'Update failed', details: err.message }, { status: 500 })
  } finally {
    client?.release()
    console.log('[PUT] DB client released')
  }
}

// ❌ DELETE — Block deleting orders
export async function DELETE() {
  console.log('[DELETE] Attempt to delete order — Not allowed')
  return NextResponse.json({ error: 'Deleting orders is not allowed' }, { status: 405 })
                                                              }
