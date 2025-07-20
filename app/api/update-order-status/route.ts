import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json()

    // Allowed status values
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Start transaction
      await client.query('BEGIN')

      // Update the order status
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

      // Insert into order_status_history for tracking
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [orderId, status, `Status changed to ${status}`, 'system'] // you can customize notes and created_by
      )

      // Commit transaction
      await client.query('COMMIT')

      // Parse items JSON if necessary
      const updatedOrder = {
        ...result.rows[0],
        items: typeof result.rows[0].items === 'string'
          ? JSON.parse(result.rows[0].items)
          : result.rows[0].items
      }

      return NextResponse.json({ success: true, order: updatedOrder })
    } catch (err) {
      // Rollback on error
      await client.query('ROLLBACK')
      console.error('Error during transaction:', err)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
