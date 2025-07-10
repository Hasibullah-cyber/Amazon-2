import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/database.ts' // ✅ update this if your db file is elsewhere

export async function GET() {
  const success = await testDatabaseConnection()
  return NextResponse.json({ success })
}
