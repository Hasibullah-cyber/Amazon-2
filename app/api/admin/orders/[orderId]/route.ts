import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ GET — Fetch Order + Status History
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    const orderRes = await client.query(
      `
      SELECT 
        id, order_id AS "orderId", user_id AS "userId", customer_name AS "customerName",
        customer_email AS "customerEmail", customer_phone AS "customerPhone",
        address, city, items, subtotal, shipping, vat,
        total_amount AS "totalAmount", status,
        payment_method AS "paymentMethod", payment_status AS "paymentStatus",
        estimated_delivery AS "estimatedDelivery", tracking_number AS "trackingNumber",
        notes, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM orders WHERE order_id = $1
      `,
      [orderId]
    )

    if (orderRes.rowCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const historyRes = await client.query(
      `
      SELECT status, notes, created_by AS "createdBy", created_at AS "createdAt"
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY created_at ASC
      `,
      [orderId]
    )

    const order = {
      ...orderRes.rows[0],
      items:
        typeof orderRes.rows[0].items === 'string'
          ? JSON.parse(orderRes.rows[0].items)
          : orderRes.rows[0].items,
      statusHistory: historyRes.rows,
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('[GET] Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  } finally {
    client.release()
  }
}

// ✅ PUT — Update Order Status and Log History
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  if (!orderId || orderId.length < 8) {
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }

  try {
    const { status, notes, createdBy } = await request.json()

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const updateRes = await client.query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING order_id`,
        [status, orderId]
      )

      if (updateRes.rowCount === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [orderId, status, notes || null, createdBy || 'system']
      )

      await client.query('COMMIT')
      return NextResponse.json({ success: true, message: 'Order status updated' })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('[PUT] Order status update error:', error)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('[PUT] Request body parse error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ✅ DELETE — Delete Order + Status History
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`DELETE FROM order_status_history WHERE order_id = $1`, [orderId])
    const deleteRes = await client.query(`DELETE FROM orders WHERE order_id = $1`, [orderId])

    await client.query('COMMIT')

    if (deleteRes.rowCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Order deleted' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[DELETE] Error deleting order:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  } finally {
    client.release()
  }
}
