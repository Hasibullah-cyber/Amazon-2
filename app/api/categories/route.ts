
import { NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'

export async function GET() {
  try {
    const categories = await storeManager.getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const category = await request.json()
    const newCategory = await storeManager.addCategory(category)
    return NextResponse.json(newCategory)
  } catch (error) {
    console.error('Error adding category:', error)
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 })
  }
}
