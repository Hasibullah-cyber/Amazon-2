
import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { status } = await request.json()
    const { orderId } = await params
    
    const client = await pool.connect()
    try {
      const result = await client.query(
        'UPDATE orders SET status = $1 WHERE order_id = $2 OR id = $2 RETURNING *',
        [status, orderId]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const updatedOrder = {
        ...result.rows[0],
        orderId: result.rows[0].order_id,
        customerName: result.rows[0].customer_name,
        customerEmail: result.rows[0].customer_email,
        customerPhone: result.rows[0].customer_phone,
        totalAmount: result.rows[0].total_amount,
        paymentMethod: result.rows[0].payment_method,
        estimatedDelivery: result.rows[0].estimated_delivery,
        createdAt: result.rows[0].created_at,
        items: typeof result.rows[0].items === 'string' 
          ? JSON.parse(result.rows[0].items) 
          : result.rows[0].items
      }

      return NextResponse.json(updatedOrder)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM orders WHERE order_id = $1 OR id = $1 RETURNING *',
        [orderId]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, deletedOrder: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
