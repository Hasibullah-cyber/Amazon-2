import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/db' // ✅ update this if your db file is elsewhere

export async function GET() {
  const success = await testDatabaseConnection()
  return NextResponse.json({ success })
}
