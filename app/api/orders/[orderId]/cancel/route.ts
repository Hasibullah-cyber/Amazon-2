import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params

  try {
    const client = await pool.connect()

    try {
      // Check if the order exists
      const check = await client.query(
        'SELECT status FROM orders WHERE id = $1',
        [orderId]
      )

      if (check.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const currentStatus = check.rows[0].status

      // Allow cancellation only for pending or processing
      if (!['pending', 'processing'].includes(currentStatus)) {
        return NextResponse.json(
          { error: 'Order cannot be cancelled at this stage' },
          { status: 400 }
        )
      }

      // Update order to cancelled
      const update = await client.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['cancelled', orderId]
      )

      // Add status to history table
      await client.query(
        'INSERT INTO order_status_history (order_id, status, notes, created_by) VALUES ($1, $2, $3, $4)',
        [orderId, 'cancelled', 'Order cancelled by user', 'user']
      )

      return NextResponse.json({ success: true, order: update.rows[0] })
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Cancel Order Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST.' },
    { status: 405 }
  )
}
