import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const client = await pool.connect()
    const result = await client.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [params.orderId]
    )
    client.release()

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      order: result.rows[0]
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
}
