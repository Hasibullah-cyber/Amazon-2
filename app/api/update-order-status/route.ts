import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json()

    console.log('🟡 Incoming request to update order:', orderId, 'to status:', status)

    // ✅ Check required fields
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 })
    }

    // ✅ Validate allowed status values
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // ✅ Update using order_id only (not numeric id)
      const result = await client.query(
        `UPDATE orders 
         SET status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE order_id = $2 
         RETURNING *`,
        [status, orderId]
      )

      console.log('🔵 Update result row count:', result.rowCount)
      console.log('🔵 Update result rows:', result.rows)

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const updatedOrder = {
        ...result.rows[0],
        items: typeof result.rows[0].items === 'string'
          ? JSON.parse(result.rows[0].items)
          : result.rows[0].items
      }

      return NextResponse.json({ success: true, order: updatedOrder })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
