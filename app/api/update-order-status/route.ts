
import { NextRequest, NextResponse } from 'next/server'
import { serverStoreManager } from '@/lib/server-store'

export async function POST(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }
    
    await serverStoreManager.updateOrderStatus(orderId, status)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
