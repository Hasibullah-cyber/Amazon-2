import { NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'

export async function GET() {
  try {
    const orders = await storeManager.getOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const order = await request.json()
    const newOrder = await storeManager.addOrder({
    })
    return NextResponse.json(newOrder)
  } catch (error) {
    console.error('Error adding order:', error)
    return NextResponse.json({ error: 'Failed to add order' }, { status: 500 })
  }
}