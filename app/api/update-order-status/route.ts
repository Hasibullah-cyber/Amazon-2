import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const { orderId, status, notes, createdBy } = await request.json()

    // Allowed status values
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Update the order status
      const updateOrderResult = await client.query(
        `UPDATE orders
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $2
         RETURNING *`,
        [status, orderId]
      )

      if (updateOrderResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Insert status history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [orderId, status, notes || '', createdBy || 'system']
      )

      await client.query('COMMIT')

      const updatedOrder = updateOrderResult.rows[0]
      // Parse items if stored as JSON string
      if (typeof updatedOrder.items === 'string') {
        updatedOrder.items = JSON.parse(updatedOrder.items)
      }

      return NextResponse.json({ success: true, order: updatedOrder })
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Error updating order status transaction:', err)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
