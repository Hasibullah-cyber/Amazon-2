import { NextResponse } from 'next/server'
import { serverStoreManager } from '@/lib/server-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await serverStoreManager.getStats()

    // Fallback values to ensure frontend doesn't crash
    const safeStats = {
      totalOrders: stats?.totalOrders ?? 0,
      totalRevenue: stats?.totalRevenue ?? 0,
      totalCustomers: stats?.totalCustomers ?? 0,
    }

    return NextResponse.json(safeStats)
  } catch (error) {
    console.error('Error fetching stats:', error)

    // Send fallback stats so frontend doesn't crash
    return NextResponse.json({
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      error: 'Failed to fetch stats'
    }, { status: 200 }) // keep status 200 to avoid frontend rejecting it
  }
}
