
import { NextResponse } from 'next/server'
import { serverStoreManager } from '@/lib/server-store'

export async function GET() {
  try {
    const stats = await serverStoreManager.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
