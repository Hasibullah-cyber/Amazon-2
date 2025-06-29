
import { NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    console.log('API: Updating order status:', orderId, 'to', status)
    await storeManager.updateOrderStatus(orderId, status)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
