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
  try {
    const client = await pool.connect()

    const [productCount, orderCount, revenueResult, topProductsResult, avgOrderValueResult] =
      await Promise.all([
        client.query('SELECT COUNT(*) FROM products'),
        client.query('SELECT COUNT(*) FROM orders'),
        client.query(`
          SELECT COALESCE(SUM(total_price), 0) AS monthly_revenue
          FROM orders
          WHERE created_at >= date_trunc('month', CURRENT_DATE)
        `),
        client.query(`
          SELECT p.name AS product_name, COUNT(oi.product_id) AS order_count
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          GROUP BY p.name
          ORDER BY order_count DESC
          LIMIT 5
        `),
        client.query(`
          SELECT COALESCE(AVG(total_price), 0) AS avg_order_value
          FROM orders
        `),
      ])

    const data: AnalyticsData = {
      totalProducts: parseInt(productCount.rows[0].count),
      totalOrders: parseInt(orderCount.rows[0].count),
      monthlyRevenue: parseFloat(revenueResult.rows[0].monthly_revenue),
      topProducts: topProductsResult.rows.map((row) => ({
        product_name: row.product_name,
        order_count: parseInt(row.order_count),
      })),
      conversionRate: 2.1, // Static or calculated elsewhere
      avgOrderValue: parseFloat(avgOrderValueResult.rows[0].avg_order_value),
      customerSatisfaction: 91.2, // Static or placeholder
    }

    client.release()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[ADMIN_STATS_ERROR]', error)

    // Fallback static data if DB fails
    const fallbackData: AnalyticsData = {
      totalProducts: 0,
      totalOrders: 0,
      monthlyRevenue: 0,
      topProducts: [],
      conversionRate: 0,
      avgOrderValue: 0,
      customerSatisfaction: 0,
    }

    return NextResponse.json(fallbackData, { status: 500 })
  }
}
