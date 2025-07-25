import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ GET — Get order details by ID including order items
export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log('🔍 [GET] Received orderId:', orderId)

  if (!orderId) {
    console.error('❌ [GET] Missing orderId in params')
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    console.log('🔗 [GET] Database client connected')

    const result = await client.query(
      `
      SELECT o.*, 
             COALESCE(json_agg(json_build_object(
               'product_id', i.product_id,
               'quantity', i.quantity,
               'unit_price', i.unit_price
             )) FILTER (WHERE i.product_id IS NOT NULL), '[]'::json) AS items
      FROM orders o
      LEFT JOIN order_items i ON o.order_id = i.order_id
      WHERE o.order_id = $1
      GROUP BY o.order_id
      `,
      [orderId]
    )

    console.log(`📊 [GET] Query executed. Rows returned: ${result.rows.length}`)

    if (result.rows.length === 0) {
      console.warn(`⚠️ [GET] No order found with orderId: ${orderId}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    console.log('✅ [GET] Order found, sending response')
    return NextResponse.json(result.rows[0])
  } catch (dbError) {
    console.error('🔥 [GET] Database query error:', dbError.message, dbError.stack)
    return NextResponse.json(
      { error: 'Database query failed', details: dbError.message },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
      console.log('🔗 [GET] Database client released')
    }
  }
}

// ✅ PUT — Update order status and add to status history
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log('🔍 [PUT] Received orderId:', orderId)

  if (!orderId) {
    console.error('❌ [PUT] Missing orderId in params')
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  let payload: { status?: string; notes?: string; updatedBy?: string }
  try {
    payload = await request.json()
    console.log('📦 [PUT] Payload received:', payload)
  } catch (parseError) {
    console.error('🔥 [PUT] Failed to parse request JSON:', parseError.message, parseError.stack)
    return NextResponse.json(
      { error: 'Invalid JSON payload', details: parseError.message },
      { status: 400 }
    )
  }

  const { status, notes, updatedBy = 'admin' } = payload

  if (!status) {
    console.error('❌ [PUT] Missing status in payload')
    return NextResponse.json({ error: 'Missing status' }, { status: 400 })
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    console.error(`❌ [PUT] Invalid status '${status}', valid statuses are: ${validStatuses.join(', ')}`)
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    console.log('🔗 [PUT] Database client connected')

    await client.query('BEGIN')
    console.log('🔄 [PUT] Transaction started')

    const updateResult = await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    )
    console.log(`📊 [PUT] Update query executed. Rows affected: ${updateResult.rowCount}`)

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK')
      console.warn(`⚠️ [PUT] No order found with orderId: ${orderId}. Transaction rolled back.`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [orderId, status, notes || `Status changed to ${status}`, updatedBy]
    )
    console.log('✅ [PUT] Inserted new status history record')

    await client.query('COMMIT')
    console.log('✅ [PUT] Transaction committed successfully')

    return NextResponse.json({ success: true, order: updateResult.rows[0] })
  } catch (dbError) {
    if (client) {
      await client.query('ROLLBACK')
      console.error('🔥 [PUT] Transaction error, rolled back:', dbError.message, dbError.stack)
    }
    return NextResponse.json(
      { error: 'Database update failed', details: dbError.message },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
      console.log('🔗 [PUT] Database client released')
    }
  }
}

// ❌ DELETE — Not implemented for safety
export async function DELETE() {
  console.warn('❌ [DELETE] Delete operation attempted and blocked')
  return NextResponse.json(
    { error: 'Delete not allowed on orders' },
    { status: 405 }
  )
}
