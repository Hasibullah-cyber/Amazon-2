import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const { orderId, status, notes = '', createdBy = 'system' } = await request.json()

    // ✅ Allowed status list
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // ✅ Update order
      const result = await client.query(
        `UPDATE orders 
         SET status = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE order_id = $2 
         RETURNING *`,
        [status, orderId]
      )

      if (result.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // ✅ Insert into status history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by)
         VALUES ($1, $2, $3, $4)`,
        [orderId, status, notes, createdBy]
      )

      await client.query('COMMIT')

      const updatedOrder = {
        ...result.rows[0],
        items: typeof result.rows[0].items === 'string'
          ? JSON.parse(result.rows[0].items)
          : result.rows[0].items
      }

      return NextResponse.json({ success: true, order: updatedOrder })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
