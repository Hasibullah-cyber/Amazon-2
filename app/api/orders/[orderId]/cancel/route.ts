import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// ✅ Handle POST — Cancel the order
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // ✅ Check if order exists
    const result = await client.query('SELECT status FROM orders WHERE id = $1', [orderId])
    if (result.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const currentStatus = result.rows[0].status
    if (currentStatus === 'cancelled') {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 })
    }

    // ✅ Update status to 'cancelled'
    await client.query('UPDATE orders SET status = $1 WHERE id = $2', ['cancelled', orderId])

    // ✅ Insert into order_status_history
    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes, created_by)
       VALUES ($1, $2, $3, $4)`,
      [orderId, 'cancelled', 'Order was cancelled by user', 'user']
    )

    await client.query('COMMIT')

    return NextResponse.json({ message: 'Order cancelled successfully' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  } finally {
    client.release()
  }
}

// ✅ Handle other methods (GET, PUT, DELETE) — disallowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed. Use POST to cancel an order.' },
    { status: 405 }
  )
}
