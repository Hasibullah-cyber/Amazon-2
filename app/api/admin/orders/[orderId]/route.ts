// app/api/admin/orders/[orderId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// GET: Fetch a single order by ID
export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params
  console.log(`🔍 GET /admin/orders/${orderId}`)

  try {
    const result = await pool.query('SELECT * FROM orders WHERE order_id = $1', [orderId])
    if (result.rows.length === 0) {
      console.warn(`❌ Order not found: ${orderId}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error(`❌ Failed to fetch order: ${error}`)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH: Update order details
export async function PATCH(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params
  console.log(`✏️ PATCH /admin/orders/${orderId}`)

  try {
    const body = await req.json()
    const fields = Object.keys(body)
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 })
    }

    const updates = fields.map((field, i) => `${field} = $${i + 1}`).join(', ')
    const values = fields.map(field => body[field])

    const query = `UPDATE orders SET ${updates} WHERE order_id = $${fields.length + 1} RETURNING *`
    const result = await pool.query(query, [...values, orderId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error(`❌ Failed to update order: ${error}`)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE: Remove an order (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params
  console.log(`🗑️ DELETE /admin/orders/${orderId}`)

  try {
    const result = await pool.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [orderId])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error(`❌ Failed to delete order: ${error}`)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
