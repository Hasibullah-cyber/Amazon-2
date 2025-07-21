import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  console.log('▶️ PUT /api/admin/orders/[orderId] called')

  try {
    const body = await request.json()
    console.log('📦 Request body:', body)

    const { status, notes, createdBy } = body
    const { orderId } = params

    if (!status || typeof status !== 'string') {
      console.warn('⚠️ Missing or invalid "status" in request')
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      console.warn(`⚠️ Invalid status value: ${status}`)
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    console.log(`ℹ️ Attempting to update order ${orderId} to status "${status}"`)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      console.log('🔁 Transaction started')

      // 1️⃣ Update order status
      const updateResult = await client.query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2`,
        [status, orderId]
      )

      console.log('📝 Order update result:', updateResult.rowCount)

      if (updateResult.rowCount === 0) {
        await client.query('ROLLBACK')
        console.warn(`❌ Order not found for order_id=${orderId}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // 2️⃣ Insert into history table
      const historyInsert = await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [orderId, status, notes || null, createdBy || 'system']
      )

      console.log('🧾 History inserted:', historyInsert.rowCount)

      await client.query('COMMIT')
      console.log('✅ Transaction committed successfully')

      return NextResponse.json({ success: true, message: 'Order status updated' })

    } catch (error) {
      await client.query('ROLLBACK')
      console.error('🔥 Error during transaction:', error)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    } finally {
      client.release()
      console.log('🔓 DB connection released')
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
