import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCredentials } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const isValid = await verifyAdminCredentials(username, password)

    if (isValid) {
      return NextResponse.json({ 
        success: true, 
        admin: { username, role: 'admin' } 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}