import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000) // 4s timeout

    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://amazon-2-2ose.vercel.app' // ✅ Your deployed URL

    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!res.ok) {
      throw new Error(`Stats fetch failed: ${res.status}`)
    }

    const stats = await res.json()

    return NextResponse.json({
      totalOrders: stats?.totalOrders ?? 0,
      totalRevenue: stats?.totalRevenue ?? 0,
      totalCustomers: stats?.totalCustomers ?? 0,
    })
  } catch (error: any) {
    console.error('❌ Failed to fetch stats:', error?.message || error)

    return NextResponse.json(
      {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        error: 'Failed to fetch stats',
      },
      { status: 200 } // fallback success to avoid crash
    )
  }
}
