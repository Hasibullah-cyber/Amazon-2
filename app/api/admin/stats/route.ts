import { NextResponse } from 'next/server'
import { serverStoreManager } from '@/lib/server-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await serverStoreManager.getStats()

    if (!stats || typeof stats !== 'object') {
      throw new Error('Invalid stats data received')
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
