import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

interface AnalyticsData {
  totalProducts: number
  totalOrders: number
  monthlyRevenue: number
  topProducts: { product_name: string; order_count: number }[]
  conversionRate: number
  avgOrderValue: number
  customerSatisfaction: number
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const data: AnalyticsData = {
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    topProducts: [],
    conversionRate: 2.1,
    avgOrderValue: 0,
    customerSatisfaction: 91.2,
  }

  try {
    const client = await pool.connect()

    try {
      const result = await client.query('SELECT COUNT(*) FROM products')
      data.totalProducts = parseInt(result.rows[0].count)
    } catch (err) {
      console.error('[ERROR] totalProducts:', err)
    }

    try {
      const result = await client.query('SELECT COUNT(*) FROM orders')
      data.totalOrders = parseInt(result.rows[0].count)
    } catch (err) {
      console.error('[ERROR] totalOrders:', err)
    }

    try {
      const result = await client.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS monthly_revenue
        FROM orders
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
      `)
      data.monthlyRevenue = parseFloat(result.rows[0].monthly_revenue)
    } catch (err) {
      console.error('[ERROR] monthlyRevenue:', err)
    }

    try {
      const result = await client.query(`
        SELECT p.name AS product_name, COUNT(oi->>'product_id') AS order_count
        FROM orders o,
        LATERAL jsonb_array_elements(o.order_items) AS oi
        JOIN products p ON (oi->>'product_id')::int = p.id
        GROUP BY p.name
        ORDER BY order_count DESC
        LIMIT 5
      `)
      data.topProducts = result.rows.map((row) => ({
        product_name: row.product_name,
        order_count: parseInt(row.order_count),
      }))
    } catch (err) {
      console.error('[ERROR] topProducts:', err)
    }

    try {
      const result = await client.query(`
        SELECT COALESCE(AVG(total_amount), 0) AS avg_order_value
        FROM orders
      `)
      data.avgOrderValue = parseFloat(result.rows[0].avg_order_value)
    } catch (err) {
      console.error('[ERROR] avgOrderValue:', err)
    }

    client.release()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[ADMIN_STATS_FATAL_ERROR]', error)
    return NextResponse.json(data, { status: 500 })
  }
}
