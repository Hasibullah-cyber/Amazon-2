import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/your-db-file' // update with correct path

export async function GET() {
  const success = await testDatabaseConnection()
  return NextResponse.json({ success })
}
