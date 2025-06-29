
import { NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    const orders = await storeManager.getUserOrders(userEmail)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json({ error: 'Failed to fetch user orders' }, { status: 500 })
  }
}
