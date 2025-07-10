// app/api/debug-orders/route.ts
import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database.ts'

export async function GET() {
  const result = await executeQuery('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5')
  return NextResponse.json(result.rows)
}
