import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params

  try {
    const client = await pool.connect()
    try {
      // Check current status first
      const check = await client.query(
        'SELECT status FROM orders WHERE id = $1',
        [orderId]
      )
      if (check.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      const currentStatus = check.rows[0].status

      // Allow cancellation only if status is pending or processing
      if (!['pending', 'processing'].includes(currentStatus)) {
        return NextResponse.json({ error: 'Order cannot be cancelled at this stage' }, { status: 400 })
      }

      // Update status to cancelled
      const result = await client.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['cancelled', orderId]
      )

      return NextResponse.json({ success: true, order: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  }
}
