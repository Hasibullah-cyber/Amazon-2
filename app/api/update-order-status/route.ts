
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json()
    
    const client = await pool.connect()
    try {
      // Update in database
      const result = await client.query(
        'UPDATE orders SET status = $1 WHERE order_id = $2 OR id = $2 RETURNING *',
        [status, orderId]
      )
      
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
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
