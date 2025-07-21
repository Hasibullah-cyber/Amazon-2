import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

// ✅ PUT — Update Order Status and Log History
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { status, notes, createdBy } = await request.json();
    const { orderId } = params;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // ✅ Update order status
      const updateResult = await client.query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2`,
        [status, orderId]
      );

      if (updateResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // ✅ Insert into order_status_history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [orderId, status, notes || null, createdBy || 'system']
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true, message: 'Order status updated' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('PUT error:', error);
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('PUT outer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ DELETE — Delete Order and History
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete from order_status_history first to maintain FK integrity
      await client.query(`DELETE FROM order_status_history WHERE order_id = $1`, [orderId]);

      // Then delete the order
      const result = await client.query(`DELETE FROM orders WHERE order_id = $1`, [orderId]);

      await client.query('COMMIT');

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Order deleted' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('DELETE error:', error);
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('DELETE outer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ GET — Fetch Order + Status History
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const client = await pool.connect();
    try {
      // Get order
      const orderResult = await client.query(`
        SELECT 
          id, order_id AS "orderId", user_id AS "userId", customer_name AS "customerName",
          customer_email AS "customerEmail", customer_phone AS "customerPhone",
          address, city, items, subtotal, shipping, vat,
          total_amount AS "totalAmount", status,
          payment_method AS "paymentMethod", payment_status AS "paymentStatus",
          estimated_delivery AS "estimatedDelivery", tracking_number AS "trackingNumber",
          notes, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM orders 
        WHERE order_id = $1
      `, [orderId]);

      if (orderResult.rows.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Get history
      const historyResult = await client.query(`
        SELECT status, notes, created_by AS "createdBy", created_at AS "createdAt"
        FROM order_status_history
        WHERE order_id = $1
        ORDER BY created_at ASC
      `, [orderId]);

      const order = {
        ...orderResult.rows[0],
        items: typeof orderResult.rows[0].items === 'string'
          ? JSON.parse(orderResult.rows[0].items)
          : orderResult.rows[0].items,
        statusHistory: historyResult.rows
      };

      return NextResponse.json(order);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
