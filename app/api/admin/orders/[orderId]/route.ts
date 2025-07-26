// app/api/admin/orders/[orderId]/route.ts


import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Allowed fields to update in PATCH
const ALLOWED_UPDATE_FIELDS = ['status', 'notes', 'customerName', 'customerEmail', 'customerPhone', 'address', 'city', 'paymentMethod', 'subtotal', 'shipping', 'vat', 'totalAmount']

// GET: Fetch a single order by ID
export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params
  console.log(`🔍 GET /api/admin/orders/${orderId}`)

  try {
    const result = await pool.query('SELECT * FROM orders WHERE order_id = $1', [orderId])
    if (result.rows.length === 0) {
      console.warn(`❌ Order not found: ${orderId}`)
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }
    console.log(`✅ Order found: ${orderId}`)
    return NextResponse.json({ success: true, order: result.rows[0] })
  } catch (error) {
    console.error(`❌ Failed to fetch order ${orderId}:`, error)
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH: Update order details
export async function PATCH(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params
  console.log(`✏️ PATCH /api/admin/orders/${orderId}`)

  try {
    const body = await req.json()
    console.log('🔧 PATCH data received:', body)

    if (!body || Object.keys(body).length === 0) {
      console.warn('⚠️ No update data provided in PATCH request')
      return NextResponse.json({ success: false, error: 'No update data provided' }, { status: 400 })
    }

    // Validate fields - only allow certain fields to be updated
    const invalidFields = Object.keys(body).filter(field => !ALLOWED_UPDATE_FIELDS.includes(field))
    if (invalidFields.length > 0) {
      console.warn('⚠️ Attempt to update invalid fields:', invalidFields)
      return NextResponse.json({ success: false, error: `Invalid fields in update: ${invalidFields.join(', ')}` }, { status: 400 })
    }

    const fields = Object.keys(body)
    const updates = fields.map((field, i) => `${field} = $${i + 1}`).join(', ')
    const values = fields.map(field => body[field])

    const query = `UPDATE orders SET ${updates} WHERE order_id = $${fields.length + 1} RETURNING *`
    console.log('📝 Executing query:', query)
    console.log('🧩 Query values:', [...values, orderId])

    const result = await pool.query(query, [...values, orderId])

    if (result.rows.length === 0) {
      console.warn(`❌ Order not found for update: ${orderId}`)
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    console.log(`✅ Order updated successfully: ${orderId}`)
    return NextResponse.json({ success: true, order: result.rows[0] })
  } catch (error) {
    console.error(`❌ Failed to update order ${orderId}:`, error)
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE: Remove an order (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params
  console.log(`🗑️ DELETE /api/admin/orders/${orderId}`)

  try {
    const result = await pool.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [orderId])
    if (result.rows.length === 0) {
      console.warn(`❌ Order not found for deletion: ${orderId}`)
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }
    console.log(`✅ Order deleted successfully: ${orderId}`)
    return NextResponse.json({ success: true, message: 'Order deleted successfully', order: result.rows[0] })
  } catch (error) {
    console.error(`❌ Failed to delete order ${orderId}:`, error)
    return NextResponse.json({ success: false, error: 'Failed to delete order' }, { status: 500 })
  }
}
