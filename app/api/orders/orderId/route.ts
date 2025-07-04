import { NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT 
        id, 
        order_id AS "orderId",
        customer_name AS "customerName",
        items,
        total_amount AS "totalAmount",
        tracking_number AS "trackingNumber",
        status,
        created_at AS "createdAt"
       FROM orders 
       WHERE order_id = $1`,
      [params.orderId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...result.rows[0],
        items: typeof result.rows[0].items === 'string' 
          ? JSON.parse(result.rows[0].items) 
          : result.rows[0].items
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
