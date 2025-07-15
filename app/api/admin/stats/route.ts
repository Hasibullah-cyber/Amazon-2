import { NextResponse } from 'next/server'
import { serverStoreManager } from '@/lib/server-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000) // 4s timeout

    const stats = await serverStoreManager.getStats()

    clearTimeout(timeout)

    const safeStats = {
      totalOrders: stats?.totalOrders ?? 0,
      totalRevenue: stats?.totalRevenue ?? 0,
      totalCustomers: stats?.totalCustomers ?? 0,
    }

    return NextResponse.json(safeStats)
  } catch (error: any) {
    console.error('Error fetching stats:', error?.message || error)

    return NextResponse.json({
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      error: 'Failed to fetch stats'
    }, { status: 200 }) // Send fallback to avoid crashing frontend
  }
}
