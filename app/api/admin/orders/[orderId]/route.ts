
import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, pool } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { status, notes } = await request.json()
    const { orderId } = params

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const success = await updateOrderStatus(orderId, status, notes)

    if (success) {
      return NextResponse.json({ success: true, message: 'Order status updated successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      
      // Delete order status history first
      await client.query('DELETE FROM order_status_history WHERE order_id = $1', [orderId])
      
      // Delete the order
      const result = await client.query('DELETE FROM orders WHERE order_id = $1', [orderId])
      
      await client.query('COMMIT')

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, message: 'Order deleted successfully' })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const client = await pool.connect()

    try {
      // Get order details
      const orderResult = await client.query(`
        SELECT 
          id, order_id as "orderId", user_id as "userId", customer_name as "customerName",
          customer_email as "customerEmail", customer_phone as "customerPhone",
          address, city, items, subtotal, shipping, vat, total_amount as "totalAmount",
          status, payment_method as "paymentMethod", payment_status as "paymentStatus",
          estimated_delivery as "estimatedDelivery", tracking_number as "trackingNumber",
          notes, created_at as "createdAt", updated_at as "updatedAt"
        FROM orders 
        WHERE order_id = $1
      `, [orderId])

      if (orderResult.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Get order status history
      const historyResult = await client.query(`
        SELECT status, notes, created_at as "createdAt"
        FROM order_status_history
        WHERE order_id = $1
        ORDER BY created_at ASC
      `, [orderId])

      const order = {
        ...orderResult.rows[0],
        items: typeof orderResult.rows[0].items === 'string' 
          ? JSON.parse(orderResult.rows[0].items) 
          : orderResult.rows[0].items,
        statusHistory: historyResult.rows
      }

      return NextResponse.json(order)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
