import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ GET — Fetch Order + Status History
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log("📥 [GET] Request received for orderId:", orderId)

  if (!orderId) {
    console.error("❌ Missing orderId in params")
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

    console.log("📊 [GET] Order rowCount:", orderRes.rowCount)

    if (orderRes.rowCount === 0) {
      console.warn("⚠️ [GET] No order found with orderId:", orderId)
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

    console.log("📜 [GET] Status history entries:", historyRes.rowCount)

    const order = {
      ...orderRes.rows[0],
      items:
        typeof orderRes.rows[0].items === 'string'
          ? JSON.parse(orderRes.rows[0].items)
          : orderRes.rows[0].items,
      statusHistory: historyRes.rows,
    }

    console.log("✅ [GET] Order and history fetched successfully")
    return NextResponse.json(order)
  } catch (error: any) {
    console.error("💥 [GET] Error:", error)
    return NextResponse.json({ error: 'Failed to fetch order', details: error.message }, { status: 500 })
  } finally {
    client.release()
    console.log("🔁 [GET] DB connection released")
  }
}

// ✅ PUT — Update Order Status and Log History
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log("📥 [PUT] Request to update orderId:", orderId)

  if (!orderId || orderId.length < 8) {
    console.error("❌ [PUT] Invalid or missing orderId")
    return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
  }

  let status: string, notes: string, createdBy: string

  try {
    const body = await request.json()
    status = body.status
    notes = body.notes || null
    createdBy = body.createdBy || 'system'
  } catch (err) {
    console.error("💥 [PUT] Failed to parse request JSON:", err)
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!status || !validStatuses.includes(status)) {
    console.error("❌ [PUT] Invalid status:", status)
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.log("🔄 [PUT] Started transaction")

    const updateRes = await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING order_id`,
      [status, orderId]
    )

    if (updateRes.rowCount === 0) {
      await client.query('ROLLBACK')
      console.warn("⚠️ [PUT] No order found to update")
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [orderId, status, notes, createdBy]
    )

    await client.query('COMMIT')
    console.log("✅ [PUT] Order status updated and history logged")
    return NextResponse.json({ success: true, message: 'Order status updated' })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error("💥 [PUT] Error during transaction:", error)
    return NextResponse.json({ error: 'Failed to update order status', details: error.message }, { status: 500 })
  } finally {
    client.release()
    console.log("🔁 [PUT] DB connection released")
  }
}

// ✅ DELETE — Delete Order + Status History
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log("📥 [DELETE] Request to delete orderId:", orderId)

  if (!orderId) {
    console.error("❌ [DELETE] Missing orderId")
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.log("🔄 [DELETE] Started transaction")

    await client.query(`DELETE FROM order_status_history WHERE order_id = $1`, [orderId])
    const deleteRes = await client.query(`DELETE FROM orders WHERE order_id = $1`, [orderId])

    if (deleteRes.rowCount === 0) {
      await client.query('ROLLBACK')
      console.warn("⚠️ [DELETE] No order found to delete")
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await client.query('COMMIT')
    console.log("✅ [DELETE] Order and status history deleted")
    return NextResponse.json({ success: true, message: 'Order deleted' })
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error("💥 [DELETE] Error during deletion:", error)
    return NextResponse.json({ error: 'Failed to delete order', details: error.message }, { status: 500 })
  } finally {
    client.release()
    console.log("🔁 [DELETE] DB connection released")
  }
}
