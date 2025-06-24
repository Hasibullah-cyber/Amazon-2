
import { NextRequest, NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    const userName = searchParams.get('name')
    
    const allOrders = await storeManager.getOrders()
    
    // Filter orders for the specific user
    const userOrders = userEmail ? 
      allOrders.filter(order => 
        order.customerEmail === userEmail || 
        order.customerName === userName
      ) : []
    
    return NextResponse.json(userOrders)
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
