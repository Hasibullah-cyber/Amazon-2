
import { NextRequest, NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    console.log('Tracking order:', orderId)
    
    // Get all orders and find the one with matching ID
    const orders = await storeManager.getOrders()
    const order = orders.find(o => o.orderId === orderId || o.id === orderId)
    
    if (!order) {
      // Return sample tracking data for demo orders
      if (orderId.startsWith('HS-')) {
        const sampleOrder = {
          orderId: orderId,
          status: 'shipped',
          customerName: 'Demo Customer',
          totalAmount: 199.99,
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          tracking: {
            orderPlaced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            processing: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            shipped: new Date().toISOString(),
            delivered: null
          },
          items: [
            { name: 'Sample Product', quantity: 1, price: 199.99 }
          ]
        }
        return NextResponse.json({ success: true, order: sampleOrder })
      }
      
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Add tracking information to the order
    const orderWithTracking = {
      ...order,
      tracking: {
        orderPlaced: order.createdAt,
        processing: order.status !== 'pending' ? order.createdAt : null,
        shipped: order.status === 'shipped' || order.status === 'delivered' ? order.createdAt : null,
        delivered: order.status === 'delivered' ? order.createdAt : null
      },
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json({ success: true, order: orderWithTracking })
  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 })
  }
}
