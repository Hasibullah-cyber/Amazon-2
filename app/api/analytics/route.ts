import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

interface AnalyticsData {
  totalProducts: number
  totalOrders: number
  monthlyRevenue: number
  topProducts: { product_name: string, order_count: number }[]
  conversionRate: number
  avgOrderValue: number
  customerSatisfaction: number
}

export async function GET() {
  let client
  try {
    client = await pool.connect()

    const [
      productsResult,
      ordersResult,
      revenueResult,
      topProductsResult
    ] = await Promise.all([
      client.query(`SELECT COUNT(*) AS total_products FROM products`),
      client.query(`SELECT COUNT(*) AS total_orders FROM orders`),
      client.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS monthly_revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `),
      client.query(`
        SELECT 
          oi.product_name,
          COUNT(*) AS order_count
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY oi.product_name
        ORDER BY order_count DESC
        LIMIT 5
      `)
    ])

    const analytics: AnalyticsData = {
      totalProducts: parseInt(productsResult.rows[0]?.total_products ?? '0', 10),
      totalOrders: parseInt(ordersResult.rows[0]?.total_orders ?? '0', 10),
      monthlyRevenue: parseFloat(revenueResult.rows[0]?.monthly_revenue ?? '0'),
      topProducts: topProductsResult.rows.map((row: any) => ({
        product_name: row.product_name,
        order_count: parseInt(row.order_count, 10)
      })),
      conversionRate: 3.2, // Placeholder/mock
      avgOrderValue: 145.5, // Placeholder/mock
      customerSatisfaction: 4.6 // Placeholder/mock
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error fetching analytics:', error)

    // Fallback static data (optional)
    const fallbackData: AnalyticsData = {
      totalProducts: 25,
      totalOrders: 150,
      monthlyRevenue: 15750.00,
      topProducts: [
        { product_name: "Wireless Headphones", order_count: 12 },
        { product_name: "Designer Sunglasses", order_count: 8 },
        { product_name: "Skincare Set", order_count: 6 }
      ],
      conversionRate: 3.2,
      avgOrderValue: 145.5,
      customerSatisfaction: 4.6
    }

    return NextResponse.json(fallbackData, { status: 200 })
  } finally {
    client?.release()
  }
}

export async function POST(request: Request) {
  try {
    const event = await request.json()
    console.log('Analytics event received:', event)

    // (Optional) Save analytics event to database/log here

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging analytics event:', error)
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}
