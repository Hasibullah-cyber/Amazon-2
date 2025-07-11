import { NextResponse } from 'next/server'
import { pool } from '@/lib/database.ts'
import { demoProducts } from '@/lib/demo-products'

export async function POST() {
  const client = await pool.connect()

  try {
    for (const product of demoProducts) {
      await client.query(`
        INSERT INTO products (id, name, price, stock, image)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [product.id, product.name, product.price, product.stock, product.image])
    }

    return NextResponse.json({ success: true, message: 'Products seeded successfully' })
  } catch (error) {
    console.error('Product seeding failed:', error)
    return NextResponse.json({ success: false, error: 'Seeding failed' }, { status: 500 })
  } finally {
    client.release()
  }
}
