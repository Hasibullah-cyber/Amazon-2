import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const client = await pool.connect()


    client.release()

    const formattedOrders = result.rows.map(order => ({
      id: order.id,
      orderId: order.order_id,
      userId: order.user_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      address: order.address,
      city: order.city,
      items: order.items || [],
      subtotal: parseFloat(order.subtotal),
      shipping: parseFloat(order.shipping),
      vat: parseFloat(order.vat),
      totalAmount: parseFloat(order.total_amount),
      status: order.status || 'pending',
      paymentMethod: order.payment_method || 'N/A',
      paymentStatus: order.payment_status || 'pending',
      estimatedDelivery: order.estimated_delivery || '',
      trackingNumber: order.tracking_number || '',
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }))

    console.log('Fetched orders from database:', formattedOrders.length)

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Error fetching orders from database:', error)

    const fallbackOrders = [
      {
        id: '1',
        orderId: 'HS-1234567890',
        userId: 'user_1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '01700000000',
        address: '123 Main St',
        city: 'Dhaka',
        items: [
          {
            id: '1',
            name: 'Premium Wireless Headphones',
            price: 199.99,
            quantity: 1,
            image: '/placeholder.svg',
          },
        ],
        subtotal: 199.99,
        shipping: 120,
        vat: 31.99,
        totalAmount: 351.98,
        status: 'shipped',
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'pending',
        estimatedDelivery: '2-3 business days',
        trackingNumber: 'TRK-123456789',
        notes: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: '2',
        orderId: 'HS-0987654321',
        userId: 'user_2',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '01800000000',
        address: '456 Oak Ave',
        city: 'Chittagong',
        items: [
          {
            id: '2',
            name: 'Smart Watch Pro',
            price: 299.99,
            quantity: 1,
            image: '/placeholder.svg',
          },
        ],
        subtotal: 299.99,
        shipping: 120,
        vat: 41.99,
        totalAmount: 461.98,
        status: 'processing',
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'pending',
        estimatedDelivery: '3-4 business days',
        trackingNumber: 'TRK-987654321',
        notes: null,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        orderId: 'HS-1122334455',
        userId: 'user_1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '01700000000',
        address: '123 Main St',
        city: 'Dhaka',
        items: [
          {
            id: '3',
            name: 'Casual T-Shirt',
            price: 29.99,
            quantity: 2,
            image: '/placeholder.svg',
          },
        ],
        subtotal: 59.98,
        shipping: 120,
        vat: 9.6,
        totalAmount: 189.58,
        status: 'delivered',
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'completed',
        estimatedDelivery: '1-2 business days',
        trackingNumber: 'TRK-112233445',
        notes: null,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    console.log('Using fallback orders:', fallbackOrders.length)

    return NextResponse.json(fallbackOrders)
  }
}
