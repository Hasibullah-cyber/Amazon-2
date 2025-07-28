import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

interface AnalyticsData {
  totalProducts: number
  totalOrders: number
  totalUsers: number
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
    totalUsers: 0,
    monthlyRevenue: 0,
    topProducts: [],
    conversionRate: 0,
    avgOrderValue: 0,
    customerSatisfaction: 91.2,
  }

  let client;
  
  try {
    client = await pool.connect()

    // Run all queries in parallel
    const [
      productsResult,
      ordersResult,
      usersResult,
      revenueResult,
      topProductsResult,
      avgOrderResult
    ] = await Promise.all([
      client.query('SELECT COUNT(*) FROM products'),
      client.query('SELECT COUNT(*) FROM orders'),
      client.query('SELECT COUNT(*) FROM users'),
      client.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS monthly_revenue
        FROM orders
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
      `),
      client.query(`
        SELECT p.name AS product_name, COUNT(oi.*) AS order_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.name
        ORDER BY order_count DESC
        LIMIT 5
      `),
      client.query(`
        SELECT COALESCE(AVG(total_amount), 0) AS avg_order_value
        FROM orders
      `)
    ])

    // Process results
    data.totalProducts = parseInt(productsResult.rows[0].count)
    data.totalOrders = parseInt(ordersResult.rows[0].count)
    data.totalUsers = parseInt(usersResult.rows[0].count)
    data.monthlyRevenue = parseFloat(revenueResult.rows[0].monthly_revenue)
    data.avgOrderValue = parseFloat(avgOrderResult.rows[0].avg_order_value)
    
    data.topProducts = topProductsResult.rows.map(row => ({
      product_name: row.product_name,
      order_count: parseInt(row.order_count),
    }))

    // Calculate conversion rate
    if (data.totalUsers > 0) {
      data.conversionRate = parseFloat(
        ((data.totalOrders / data.totalUsers) * 100).toFixed(2)
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('[ADMIN_STATS_ERROR]', error)
    return NextResponse.json(
      { 
        message: 'Failed to fetch analytics data',
        error: error instanceof Error ? error.message : 'Unknown error',
        partialData: data
      }, 
      { status: 500 }
    )
  } finally {
    if (client) client.release()
  }
}
